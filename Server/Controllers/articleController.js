const Article = require('../Models/Article');
const User = require('../Models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../Config/cloudinary');

// @desc    Get all approved articles with optional search
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { isApproved: true };

    // Search filter
    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const articles = await Article.find(query)
      .populate('author', 'name firstName lastName')
      .populate('lastEditor', 'name firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      data: articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
      error: error.message,
    });
  }
};

// @desc    Get all articles (including pending) - Admin only
// @route   GET /api/articles/all
// @access  Private/Admin
exports.getAllArticles = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = {};

    // Status filter
    if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    }

    // Search filter
    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const articles = await Article.find(query)
      .populate('author', 'name firstName lastName email')
      .populate('lastEditor', 'name firstName lastName')
      .populate('approvedBy', 'name firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      data: articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
      error: error.message,
    });
  }
};

// @desc    Get single article
// @route   GET /api/articles/:id
// @access  Public
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name firstName lastName')
      .populate('lastEditor', 'name firstName lastName');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Increment view count
    article.viewCount += 1;
    await article.save();

    // Only show approved articles to non-admin users
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'master')) {
      if (!article.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Article not approved yet',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message,
    });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private (any authenticated user)
exports.createArticle = async (req, res) => {
  try {
    const { topic, body, summary } = req.body;

    if (!topic || !body) {
      return res.status(400).json({
        success: false,
        message: 'Please provide topic and body',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const articleData = {
      topic,
      body,
      summary: summary || '',
      author: req.user.id,
      authorName: user.name || `${user.firstName} ${user.lastName}`,
      isApproved: false, // User articles need admin approval
    };

    // Handle photo upload
    if (req.files && req.files.photo) {
      const photoResult = await uploadToCloudinary(req.files.photo[0].buffer, 'sri-lankan-nutrition/articles', {
        resourceType: 'image',
      });
      articleData.photo = photoResult.secure_url;
      articleData.photoCloudinaryId = photoResult.public_id;
    }

    // Handle video upload
    if (req.files && req.files.video) {
      const videoResult = await uploadToCloudinary(req.files.video[0].buffer, 'sri-lankan-nutrition/articles', {
        resourceType: 'video',
      });
      articleData.video = videoResult.secure_url;
      articleData.videoCloudinaryId = videoResult.public_id;
    }

    const article = await Article.create(articleData);

    const populatedArticle = await Article.findById(article._id)
      .populate('author', 'name firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Article created successfully. Waiting for admin approval.',
      data: populatedArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating article',
      error: error.message,
    });
  }
};

// @desc    Update article (admin can always edit, users need permission)
// @route   PUT /api/articles/:id
// @access  Private
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'master';
    const isAuthor = article.author.toString() === req.user.id.toString();

    // Check permissions
    if (!isAdmin && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this article',
      });
    }

    // If user is author (not admin), check if they have permission to edit
    if (isAuthor && !isAdmin) {
      // Check if there's an approved edit request
      const hasApprovedEditRequest = article.editRequests.some(
        req => req.requestedBy.toString() === req.user.id.toString() && req.approved === true
      );

      if (!hasApprovedEditRequest) {
        return res.status(403).json({
          success: false,
          message: 'You need admin permission to edit this article',
        });
      }
    }

    const { topic, body, summary } = req.body;

    // Update fields
    if (topic) article.topic = topic;
    if (body) article.body = body;
    if (summary !== undefined) article.summary = summary;

    // Handle photo upload/update
    if (req.files && req.files.photo) {
      // Delete old photo if exists
      if (article.photoCloudinaryId) {
        try {
          await deleteFromCloudinary(article.photoCloudinaryId);
        } catch (error) {
          console.error('Error deleting old photo:', error);
        }
      }

      const photoResult = await uploadToCloudinary(req.files.photo[0].buffer, 'sri-lankan-nutrition/articles', {
        resourceType: 'image',
      });
      article.photo = photoResult.secure_url;
      article.photoCloudinaryId = photoResult.public_id;
    }

    // Handle video upload/update
    if (req.files && req.files.video) {
      // Delete old video if exists
      if (article.videoCloudinaryId) {
        try {
          await deleteFromCloudinary(article.videoCloudinaryId);
        } catch (error) {
          console.error('Error deleting old video:', error);
        }
      }

      const videoResult = await uploadToCloudinary(req.files.video[0].buffer, 'sri-lankan-nutrition/articles', {
        resourceType: 'video',
      });
      article.video = videoResult.secure_url;
      article.videoCloudinaryId = videoResult.public_id;
    }

    // Update editor info
    if (isAdmin || (isAuthor && article.editRequests.some(req => req.approved))) {
      const editor = await User.findById(req.user.id);
      article.lastEditor = req.user.id;
      article.lastEditorName = editor?.name || `${editor?.firstName} ${editor?.lastName}`;
      article.isEdited = true;
    }

    // Remove approved edit requests after editing
    if (isAuthor && !isAdmin) {
      article.editRequests = article.editRequests.filter(req => !req.approved || req.requestedBy.toString() !== req.user.id.toString());
    }

    await article.save();

    const updatedArticle = await Article.findById(article._id)
      .populate('author', 'name firstName lastName')
      .populate('lastEditor', 'name firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: updatedArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating article',
      error: error.message,
    });
  }
};

// @desc    Request edit permission
// @route   POST /api/articles/:id/request-edit
// @access  Private
exports.requestEditPermission = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const isAuthor = article.author.toString() === req.user.id.toString();

    if (!isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Only the article author can request edit permission',
      });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'master';
    if (isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admins do not need to request edit permission',
      });
    }

    // Check if there's already a pending request
    const hasPendingRequest = article.editRequests.some(
      req => req.requestedBy.toString() === req.user.id.toString() && !req.approved
    );

    if (hasPendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending edit request',
      });
    }

    article.editRequests.push({
      requestedBy: req.user.id,
      reason: req.body.reason || '',
    });

    await article.save();

    res.status(200).json({
      success: true,
      message: 'Edit request submitted. Waiting for admin approval.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting edit permission',
      error: error.message,
    });
  }
};

// @desc    Approve article
// @route   PUT /api/articles/:id/approve
// @access  Private/Admin
exports.approveArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const adminUser = await User.findById(req.admin?.id || req.user?.id);
    const adminId = req.admin?.id || req.user?.id;

    article.isApproved = true;
    article.approvedBy = adminId;
    article.approvedAt = new Date();

    await article.save();

    const updatedArticle = await Article.findById(article._id)
      .populate('author', 'name firstName lastName')
      .populate('approvedBy', 'name firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Article approved successfully',
      data: updatedArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving article',
      error: error.message,
    });
  }
};

// @desc    Approve edit request
// @route   PUT /api/articles/:id/approve-edit/:requestId
// @access  Private/Admin
exports.approveEditRequest = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const editRequest = article.editRequests.id(req.params.requestId);

    if (!editRequest) {
      return res.status(404).json({
        success: false,
        message: 'Edit request not found',
      });
    }

    const adminId = req.admin?.id || req.user?.id;
    editRequest.approved = true;
    editRequest.approvedBy = adminId;

    await article.save();

    res.status(200).json({
      success: true,
      message: 'Edit request approved. User can now edit the article.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving edit request',
      error: error.message,
    });
  }
};

// @desc    Admin can edit article directly before approval
// @route   PUT /api/articles/:id/admin-edit
// @access  Private/Admin
exports.adminEditArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const { topic, body, summary } = req.body;

    // Admin can edit any field
    if (topic) article.topic = topic;
    if (body) article.body = body;
    if (summary !== undefined) article.summary = summary;

    // Handle photo upload/update
    if (req.files && req.files.photo) {
      if (article.photoCloudinaryId) {
        try {
          await deleteFromCloudinary(article.photoCloudinaryId);
        } catch (error) {
          console.error('Error deleting old photo:', error);
        }
      }

      const photoResult = await uploadToCloudinary(req.files.photo[0].buffer, 'sri-lankan-nutrition/articles', {
        resourceType: 'image',
      });
      article.photo = photoResult.secure_url;
      article.photoCloudinaryId = photoResult.public_id;
    }

    // Handle video upload/update
    if (req.files && req.files.video) {
      if (article.videoCloudinaryId) {
        try {
          await deleteFromCloudinary(article.videoCloudinaryId);
        } catch (error) {
          console.error('Error deleting old video:', error);
        }
      }

      const videoResult = await uploadToCloudinary(req.files.video[0].buffer, 'sri-lankan-nutrition/articles', {
        resourceType: 'video',
      });
      article.video = videoResult.secure_url;
      article.videoCloudinaryId = videoResult.public_id;
    }

    // Update editor info
    const adminId = req.admin?.id || req.user?.id;
    const editor = await User.findById(adminId);
    article.lastEditor = adminId;
    article.lastEditorName = editor?.name || `${editor?.firstName} ${editor?.lastName}` || 'Admin';
    article.isEdited = true;

    await article.save();

    const updatedArticle = await Article.findById(article._id)
      .populate('author', 'name firstName lastName')
      .populate('lastEditor', 'name firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Article edited successfully',
      data: updatedArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error editing article',
      error: error.message,
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Delete photo and video from Cloudinary
    if (article.photoCloudinaryId) {
      try {
        await deleteFromCloudinary(article.photoCloudinaryId);
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }

    if (article.videoCloudinaryId) {
      try {
        await deleteFromCloudinary(article.videoCloudinaryId);
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting article',
      error: error.message,
    });
  }
};


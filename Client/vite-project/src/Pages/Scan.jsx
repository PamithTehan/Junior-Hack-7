import { useEffect } from 'react';

const Scan = () => {
  useEffect(() => {
    // Load TensorFlow.js and MobileNet scripts if not already loaded
    if (!window.tf) {
      const tfScript = document.createElement('script');
      tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
      tfScript.async = true;
      document.head.appendChild(tfScript);
    }

    if (!window.mobilenet) {
      const mobilenetScript = document.createElement('script');
      mobilenetScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js';
      mobilenetScript.async = true;
      document.head.appendChild(mobilenetScript);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <iframe
        src="/AutoFoodTracker/index.html"
        className="w-full h-screen border-0"
        title="Food Scanner"
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      />
    </div>
  );
};

export default Scan;


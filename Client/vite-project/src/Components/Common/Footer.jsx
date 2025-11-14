const Footer = () => {
  return (
    <footer className="bg-primary-800 dark:bg-gray-900 text-white dark:text-gray-100 mt-auto border-t border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">About</h3>
            <p className="text-primary-200 dark:text-gray-400">
              Your personalized nutrition advisor focusing on traditional Sri Lankan foods.
              Manage diabetes, obesity, and heart disease with culturally appropriate meal plans.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-primary-200 dark:text-gray-400">
              <li><a href="/meal-planner" className="hover:text-white dark:hover:text-gray-100 transition-colors">Meal Planner</a></li>
              <li><a href="/tracker" className="hover:text-white dark:hover:text-gray-100 transition-colors">Food Tracker</a></li>
              <li><a href="/recipes" className="hover:text-white dark:hover:text-gray-100 transition-colors">Recipes</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-primary-200 dark:text-gray-400">
              For support or questions, please reach out through your profile dashboard.
            </p>
          </div>
        </div>
        <div className="border-t border-primary-700 dark:border-gray-700 mt-8 pt-4 text-center text-primary-200 dark:text-gray-400">
          <p>&copy; 2024 Sri Lankan Nutrition Advisor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


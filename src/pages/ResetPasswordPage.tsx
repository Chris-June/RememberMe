import { motion } from 'framer-motion';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white p-8 rounded-lg shadow-md">
            <ResetPasswordForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
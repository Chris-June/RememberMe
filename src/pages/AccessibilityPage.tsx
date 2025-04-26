import { motion } from 'framer-motion';
import { Accessibility } from 'lucide-react';

const AccessibilityPage = () => {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-12">
            <Accessibility className="h-16 w-16 text-memorial-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-serif text-memorial-800 mb-6">Accessibility Commitment</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We are committed to ensuring Remembering Me is accessible to all users, including those with disabilities.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 prose max-w-none">
            <h2>Our Commitment to Accessibility</h2>
            <p>
              Remembering Me is committed to making our website and memorial services accessible to everyone, 
              including users with disabilities. We strive to meet or exceed the Web Content Accessibility 
              Guidelines (WCAG) 2.1 Level AA standards.
            </p>
            
            <h2>Accessibility Features</h2>
            <p>Our platform includes the following accessibility features:</p>
            <ul>
              <li><strong>Text Scaling:</strong> All text on our site can be resized without loss of functionality.</li>
              <li><strong>Color Contrast:</strong> We maintain sufficient color contrast between text and background for better readability.</li>
              <li><strong>Keyboard Navigation:</strong> All functionality is available using keyboard controls.</li>
              <li><strong>Screen Reader Compatibility:</strong> Our site is designed to work with screen readers and other assistive technologies.</li>
              <li><strong>Alternative Text:</strong> We provide descriptive alternative text for images to ensure content is accessible to users with visual impairments.</li>
              <li><strong>Form Labels:</strong> All form fields have proper labels to assist users with assistive technologies.</li>
              <li><strong>Focus Indicators:</strong> Visible focus indicators help keyboard users navigate our site.</li>
            </ul>

            <h2>What We're Working On</h2>
            <p>
              We continuously work to improve accessibility on our platform. Current initiatives include:
            </p>
            <ul>
              <li>Enhancing mobile accessibility features</li>
              <li>Improving the accessibility of our interactive timelines</li>
              <li>Implementing additional ARIA attributes for complex UI components</li>
              <li>Conducting regular accessibility audits with users who rely on assistive technologies</li>
            </ul>

            <h2>Accessibility Tips for Memorial Creators</h2>
            <p>To help make your memorial more accessible to all visitors, we recommend:</p>
            <ul>
              <li>Adding descriptive captions to photos when possible</li>
              <li>Using clear, descriptive titles for memories</li>
              <li>Avoiding using color alone to convey meaning in your content</li>
              <li>Breaking long memories into paragraphs for improved readability</li>
            </ul>

            <h2>Feedback and Assistance</h2>
            <p>
              We welcome your feedback on the accessibility of Remembering Me. If you encounter accessibility 
              barriers or have suggestions for improvement, please contact us at:
            </p>
            <p>
              Email: accessibility@rememberingme.com<br />
              Phone: (555) 123-4567
            </p>
            <p>
              If you need assistance accessing any part of our website or services, our support team is available 
              to help Monday through Friday, 9:00 AM to 5:00 PM Pacific Time.
            </p>

            <h2>Accessibility Statement Conformance</h2>
            <p>
              This accessibility statement was last reviewed and updated on May 1, 2025. It follows the requirements 
              specified in EN 301 549 Accessibility requirements for ICT products and services.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccessibilityPage;
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-memorial-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-serif text-memorial-800 mb-6">Privacy Policy</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Last Updated: May 1, 2025
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 prose max-w-none">
            <p>
              At Remembering Me, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>

            <h2>Information We Collect</h2>
            <p>We collect several types of information from and about users of our service, including:</p>
            <ul>
              <li>
                <strong>Personal Information:</strong> We collect information that you provide directly to us, such as your name, email address, and account credentials when you register for an account.
              </li>
              <li>
                <strong>Memorial Content:</strong> We collect and store the content you create or upload to the service, including memorial information, stories, memories, and photos.
              </li>
              <li>
                <strong>Usage Data:</strong> We collect information about how you interact with our service, including your browsing activity, page views, and features you use.
              </li>
              <li>
                <strong>Device Information:</strong> We may collect information about the device you use to access our service, including device type, operating system, and browser type.
              </li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including:</p>
            <ul>
              <li>Providing, maintaining, and improving our services</li>
              <li>Processing and completing transactions</li>
              <li>Sending you technical notices, updates, and administrative messages</li>
              <li>Responding to your comments, questions, and requests</li>
              <li>Personalizing your experience on our service</li>
              <li>Generating AI-powered narratives based on submitted memories</li>
              <li>Monitoring and analyzing trends, usage, and activities in connection with our service</li>
            </ul>

            <h2>Sharing Your Information</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>
                <strong>With Other Users:</strong> Information you provide for memorials, including content and media, will be shared according to the privacy settings you select for each memorial (public, family-only, or private).
              </li>
              <li>
                <strong>Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.
              </li>
              <li>
                <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.
              </li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your personal information. 
              However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </p>

            <h2>Your Data Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul>
              <li>The right to access the personal information we have about you</li>
              <li>The right to request correction of inaccurate personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to object to processing of your personal information</li>
              <li>The right to data portability</li>
            </ul>
            <p>To exercise these rights, please contact us at privacy@rememberingme.com.</p>

            <h2>Canadian Privacy Rights</h2>
            <p>
              For users in Canada, we comply with all applicable Canadian privacy laws, including the Personal Information Protection and Electronic Documents Act (PIPEDA) and provincial privacy legislation. Canadian users may have additional rights regarding their personal information, including:
            </p>
            <ul>
              <li>The right to know what personal information we hold about you and how we use it</li>
              <li>The right to access and correct your personal information</li>
              <li>The right to withdraw consent for the collection, use, or disclosure of your personal information</li>
            </ul>
            <p>
              To exercise your rights under Canadian privacy law, please contact our Privacy Officer at privacy@rememberingme.com or call 519-359-9712.
            </p>

            <h2>Children's Privacy</h2>
            <p>
              Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. 
              If you believe we might have any information from or about a child under 13, please contact us immediately.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. 
              You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: chris.june@intellisync.ca<br />
              Phone: 519-359-9712<br />
              Intellisync Solutions<br />
              Website: home.intellisyncsolutions.io
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
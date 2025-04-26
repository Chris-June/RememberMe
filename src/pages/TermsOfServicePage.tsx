import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 text-memorial-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-serif text-memorial-800 mb-6">Terms of Service</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Last Updated: May 1, 2025
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 prose max-w-none">
            <p>
              Welcome to Remembering Me. Please read these Terms of Service ("Terms") carefully before using our website 
              and memorial creation services ("Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, 
              you may not access the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Remembering Me provides an online platform for users to create digital memorials for loved ones who have passed away. 
              Our Service includes features for collecting memories, generating AI narratives, and sharing these memorials with others 
              according to user-defined privacy settings.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To use certain features of our Service, you may be required to create an account. You are responsible for maintaining 
              the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
            </p>
            <ul>
              <li>Provide accurate and complete information when creating your account</li>
              <li>Promptly update your account information as needed to keep it accurate and complete</li>
              <li>Notify us immediately of any unauthorized use of your account or any other breach of security</li>
            </ul>
            <p>
              We reserve the right to terminate accounts that violate these Terms or that have been inactive for an extended period.
            </p>

            <h2>4. User Content</h2>
            <p>
              Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, 
              videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, 
              including its legality, reliability, and appropriateness.
            </p>
            <p>
              By posting Content on or through the Service, you represent and warrant that:
            </p>
            <ul>
              <li>The Content is yours or you have the right to use it and grant us the rights and license as provided in these Terms</li>
              <li>The posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person</li>
              <li>The Content does not contain defamatory, libelous, offensive, indecent, or otherwise unlawful material</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain 
              the exclusive property of Remembering Me and its licensors. The Service is protected by copyright, trademark, and other 
              laws of both Canada and foreign countries.
            </p>
            <p>
              You retain all rights to the Content you submit, post, or display on or through the Service. By submitting, posting, or 
              displaying Content on or through the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, 
              reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such Content for the 
              purpose of providing the Service.
            </p>

            <h2>6. AI-Generated Content</h2>
            <p>
              Our Service uses artificial intelligence to generate narratives based on user-submitted memories. By using this feature, you:
            </p>
            <ul>
              <li>Acknowledge that AI-generated content is created algorithmically and may not perfectly represent the individuals described</li>
              <li>Grant us permission to process the memories you submit through our AI systems</li>
              <li>Understand that while we strive for accuracy and appropriateness, AI-generated content may require review and editing</li>
            </ul>

            <h2>7. Privacy</h2>
            <p>
              Your privacy is important to us. Please refer to our Privacy Policy for information about how we collect, use, and disclose 
              information about you. By using the Service, you agree to the collection and use of information in accordance with our 
              Privacy Policy.
            </p>

            <h2>8. Prohibited Uses</h2>
            <p>
              You agree not to use the Service:
            </p>
            <ul>
              <li>In any way that violates any applicable federal, provincial, local, or international law or regulation</li>
              <li>To impersonate or attempt to impersonate another person or entity</li>
              <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
              <li>To upload or transmit viruses, malware, or other malicious code</li>
              <li>To attempt to gain unauthorized access to any part of the Service</li>
              <li>To create memorials for living individuals or fictional persons</li>
              <li>To create content that is hateful, abusive, or otherwise harmful</li>
            </ul>

            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any 
              reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may 
              simply discontinue using the Service or contact us to request account deletion.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              In no event shall Intellisync Solutions, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
              indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, 
              use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul>
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will 
              be determined at our sole discretion.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of Canada and the province of Ontario, 
              without regard to its conflict of law provisions.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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

export default TermsOfServicePage;
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left font-medium text-lg text-memorial-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="mt-2 text-neutral-600 pl-1">
          {answer}
        </div>
      )}
    </div>
  );
};

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "How do I create a memorial?",
      answer: "To create a memorial, click on the 'Create Memorial' button on the homepage or dashboard. You'll be guided through a simple form where you can enter information about your loved one, upload a photo, and set privacy preferences. The process takes just a few minutes to complete."
    },
    {
      question: "Can I control who sees the memorial?",
      answer: "Yes, you have full control over privacy settings. You can set your memorial to: 'Public' (anyone with the link can view), 'Family Only' (only invited members can view), or 'Private' (only you can view and manage). You can change these settings at any time from the memorial settings page."
    },
    {
      question: "How do I invite others to contribute memories?",
      answer: "You can invite others by sharing the memorial link via email, messaging, or social media. If your memorial is set to 'Family Only', contributors will need to create an account to add their memories. If it's 'Public', anyone with the link can contribute memories."
    },
    {
      question: "Can I add photos to memories?",
      answer: "Yes, you can upload one photo with each memory you contribute. The photo will be displayed with your memory in the timeline and will also appear in the memorial's photo gallery."
    },
    {
      question: "How does the narrative generation work?",
      answer: "Our AI technology analyzes all the memories contributed to a memorial and generates a cohesive life narrative written in first person, as if your loved one is telling their story. The narrative is automatically updated as new memories are added, or you can manually regenerate it at any time."
    },
    {
      question: "Can I edit or delete memories after they're posted?",
      answer: "Yes, you can edit or delete any memories that you've contributed. However, you cannot edit or delete memories contributed by others unless you are the memorial creator, in which case you have moderation control over all content."
    },
    {
      question: "Is there a limit to how many memorials I can create?",
      answer: "There is no limit to the number of memorials you can create with your account."
    },
    {
      question: "How do I edit memorial information after creation?",
      answer: "To edit a memorial's information, go to the memorial page and click on the 'Settings' button (if you're the creator). From there, you can update the personal information, change the cover photo, and adjust privacy settings."
    },
    {
      question: "Can I download or print the memorial content?",
      answer: "Currently, we don't have a built-in feature to download or print the entire memorial. However, you can manually save individual photos or copy text content. We're working on adding comprehensive export features in the future."
    },
    {
      question: "What happens to the memorial if I delete my account?",
      answer: "If you delete your account, any memorials you've created will remain accessible to contributors and viewers according to their privacy settings. If you wish to remove a memorial completely, you should delete it before deleting your account."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 text-memorial-500 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-serif text-memorial-800 mb-6">Help Center</h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Find answers to frequently asked questions and learn how to make the most of your memorial experience.
            </p>
          </div>

          {/* Search */}
          <div className="mb-10">
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-memorial-500 focus:border-transparent"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-serif text-memorial-800 mb-6">Frequently Asked Questions</h2>
            
            {filteredFaqs.length > 0 ? (
              <div className="divide-y divide-neutral-200">
                {filteredFaqs.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-2">No results found for "{searchQuery}"</p>
                <p className="text-neutral-500">Try a different search term or browse all FAQs</p>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="bg-memorial-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-serif text-memorial-800 mb-4">Still Need Help?</h2>
            <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
              If you couldn't find the answer you're looking for, our support team is here to help with any questions or concerns.
            </p>
            <a 
              href="mailto:contact@rememberingme.com" 
              className="inline-flex items-center btn-primary"
            >
              <MessageSquare size={18} className="mr-2" />
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
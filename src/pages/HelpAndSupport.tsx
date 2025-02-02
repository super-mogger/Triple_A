import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Mail, MessageSquare, FileText, ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I update my workout schedule?",
    answer: "You can update your workout schedule from the Dashboard. Click on 'Workouts' and use the calendar interface to modify your schedule. Changes will be automatically saved and synced with your trainer."
  },
  {
    question: "How do I track my progress?",
    answer: "Your progress can be tracked in the Progress section. We track various metrics including weight, measurements, and workout performance. You can view your progress in graphs and detailed reports."
  },
  {
    question: "Can I change my membership plan?",
    answer: "Yes, you can change your membership plan by visiting the gym office. View available plans in the Membership section and speak with our staff for assistance with the change."
  },
  {
    question: "How do I contact my trainer?",
    answer: "Your assigned trainer's contact information is available in your profile. You can message them directly through the app or contact them during gym hours."
  },
  {
    question: "What should I do if I forget my password?",
    answer: "Click the 'Forgot Password' link on the login page. Enter your registered email address, and we'll send you instructions to reset your password."
  }
];

export default function HelpAndSupport() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Back Button and Title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        </div>

        {/* Support Overview */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How Can We Help?</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            We're here to help you with any questions or concerns. Browse through our FAQs or reach out to our support team.
          </p>
        </div>

        {/* Contact Options */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Us</h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Email Support */}
            <a href="mailto:support@tripleafitness.com" 
               className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white font-medium">Email Support</h3>
                <p className="text-sm text-gray-500">support@tripleafitness.com</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>

            {/* Live Chat */}
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-gray-900 dark:text-white font-medium">Live Chat</h3>
                <p className="text-sm text-gray-500">Chat with our support team</p>
              </div>
            </button>

            {/* Help Center */}
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-gray-900 dark:text-white font-medium">Help Center</h3>
                <p className="text-sm text-gray-500">Browse our knowledge base</p>
              </div>
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="p-4 space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl"
                >
                  <span className="text-left font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Hours */}
        <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Support Hours</h2>
          </div>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
            <p>Saturday: 9:00 AM - 6:00 PM</p>
            <p>Sunday: 10:00 AM - 4:00 PM</p>
            <p className="text-sm mt-4">* All times are in IST</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
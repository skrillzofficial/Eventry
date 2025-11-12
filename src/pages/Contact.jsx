import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // FAQ data
  const faqs = [
    {
      question: "Who can use Eventry?",
      answer: "Anyone! Eventry is built for event organizers, hosts, and attendees. Organizers can plan and manage events efficiently, while attendees can discover and book events that interest them. Our platform is designed to be user-friendly for all experience levels."
    },
    {
      question: "How do I create an event on Eventry?",
      answer: "Creating an event is simple! Click on 'Create Event' in the navigation menu, fill in your event details including title, date, venue, and ticket information. You can upload images, set ticket prices, and publish your event instantly. Our platform guides you through each step."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely! We use blockchain technology and industry-standard encryption to protect all transactions. Your payment information is never stored on our servers, and all transactions are processed through secure, verified payment gateways."
    },
    {
      question: "Can I get a refund if I can't attend an event?",
      answer: "Refund policies vary by event organizer. Each event page displays the specific refund policy. Generally, refunds are available up to 7 days before the event. For special circumstances, please contact the event organizer directly through the platform."
    },
    {
      question: "How do I receive my tickets after purchase?",
      answer: "After completing your purchase, you'll receive an instant confirmation email with your digital tickets. You can also access your tickets anytime from your account dashboard. Simply show the QR code on your phone at the event entrance."
    },
    {
      question: "What types of events can I host on Eventry?",
      answer: "Eventry supports all types of events including conferences, concerts, workshops, webinars, networking events, festivals, sports events, and more. Whether it's a small meetup or a large-scale conference, our platform scales to meet your needs."
    },
    {
      question: "How much does it cost to use Eventry?",
      answer: "Creating an account and browsing events is completely free! For event organizers, we charge a small service fee per ticket sold. There are no upfront costs or hidden fees. You only pay when you successfully sell tickets."
    },
    {
      question: "What happens if an event is cancelled?",
      answer: "If an event is cancelled by the organizer, all ticket holders are automatically notified via email. Refunds are processed within 5-7 business days. The organizer can also choose to reschedule the event and transfer existing tickets to the new date."
    },
    {
      question: "How do I contact event organizers?",
      answer: "Each event page has a 'Contact Organizer' button. You can send messages directly through the platform, and organizers typically respond within 24-48 hours. For urgent matters, check if the organizer has provided additional contact information on their event page."
    },
    {
      question: "Can I track my event's performance?",
      answer: "Yes! Our real-time analytics dashboard gives you insights into ticket sales, revenue, attendee demographics, and engagement metrics. You can track your event's performance and make data-driven decisions to improve attendance."
    }
  ];

  // Simulate page loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setLoading(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Page loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading contact page...</p>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-[#FF6B35] py-16">
        <div className="w-11/12 mx-auto container text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have questions or need support? We're here to help!
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="w-11/12 mx-auto container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FF6B35] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Email Us
                    </h3>
                    <p className="text-gray-600">support@eventry.com</p>
                    <p className="text-gray-600">event_entry@outlook.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FF6B35] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Call Us
                    </h3>
                    <p className="text-gray-600">+234 9056718819</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Mon-Fri 9am-6pm WAT
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FF6B35] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Visit Us
                    </h3>
                    <p className="text-gray-600">
                      123 Event Street,
                      <br />
                      Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </h2>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-green-900 mb-2">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-green-700">
                      Thank you for contacting us. We'll get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="What is this about?"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        rows="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Tell us how we can help..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#FF6B35] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#FF8535] transition-colors flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF6B35]"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="w-11/12 mx-auto container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked <span className="text-[#FF6B35]">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Got questions? We've got answers. Find everything you need to know about using Eventry.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#FF6B35]/30 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </h3>
                  {openFaqIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-[#FF6B35] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Still have questions?
            </p>
            <a
              href="mailto:support@eventry.com"
              className="inline-flex items-center text-[#FF6B35] hover:text-[#FF8535] font-semibold transition-colors"
            >
              Email our support team
            </a>
          </div>
        </div>
      </section>

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
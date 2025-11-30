import {
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Package,
  CreditCard,
  XCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

const ReturnsContent = () => {
  const sections = [
    {
      id: 'overview',
      title: '1. Returns Policy Overview',
      content: [
        "At Cashmitra, we want you to be completely satisfied with your purchase. If you're not happy with your device for any reason, we offer a hassle-free return and refund policy.",
        'This policy applies to all devices purchased through our platform, whether bought online or from our partner stores.',
      ],
      list: [
        '7-day return window from the date of delivery',
        'Full refund for eligible returns',
        'Free return pickup for defective products',
        'No questions asked for manufacturing defects',
        'Easy online return initiation process',
        'Transparent refund tracking',
      ],
    },
    {
      id: 'eligibility',
      title: '2. Return Eligibility Criteria',
      content: [
        'To be eligible for a return, your device must meet the following conditions:',
        'We reserve the right to reject returns that do not meet these criteria.',
      ],
      list: [
        'Return request initiated within 7 days of delivery',
        'Device in original condition with all accessories and packaging',
        'No physical damage or liquid damage caused by customer',
        'Original invoice/receipt must be provided',
        'Device not altered, modified, or repaired by unauthorized parties',
        'IMEI/Serial number matches the delivered product',
        'All original tags, stickers, and seals intact',
        'No signs of usage beyond initial inspection',
      ],
      important:
        'Please inspect your device immediately upon delivery. Report any issues within 48 hours for the fastest resolution.',
    },
    {
      id: 'non-returnable',
      title: '3. Non-Returnable Items',
      content: [
        'For hygiene, safety, and legal reasons, the following items cannot be returned:',
        'These restrictions are in place to protect all our customers and comply with applicable regulations.',
      ],
      list: [
        'Devices with customer-induced physical or liquid damage',
        'Products with missing IMEI or altered serial numbers',
        'Devices purchased during special clearance or final sale events',
        'Custom-configured or personalized devices',
        'Accessories that have been opened or used (earphones, chargers)',
        'Devices reported as lost or stolen',
        'Products purchased from unauthorized third parties',
      ],
      warning:
        'Returns involving suspected fraud will be investigated and may result in account suspension and legal action.',
    },
    {
      id: 'process',
      title: '4. Return Process - Step by Step',
      content: [
        'Returning your device is easy. Follow these simple steps to initiate and complete your return:',
        'Our customer support team is available to assist you at every step of the process.',
      ],
      steps: [
        {
          number: 1,
          title: 'Initiate Return Request',
          description:
            'Log into your account, go to "My Orders", select the product, and click "Return Item". Choose a reason for return and submit the request.',
        },
        {
          number: 2,
          title: 'Return Approval',
          description:
            "Our team will review your request within 24 hours. You'll receive an email with return approval and pickup details.",
        },
        {
          number: 3,
          title: 'Package the Device',
          description:
            'Pack the device securely in its original packaging with all accessories, manuals, and the invoice. Keep it ready for pickup.',
        },
        {
          number: 4,
          title: 'Pickup Scheduled',
          description:
            'Our logistics partner will pick up the package from your address at the scheduled time. Ensure someone is available to hand over the package.',
        },
        {
          number: 5,
          title: 'Quality Check',
          description:
            'Once we receive the device, our team will conduct a quality check within 2-3 business days to verify the condition.',
        },
        {
          number: 6,
          title: 'Refund Processed',
          description:
            "If the device passes quality check, your refund will be initiated within 24 hours. You'll receive the amount in 7-10 business days.",
        },
      ],
    },
    {
      id: 'refund-methods',
      title: '5. Refund Methods and Timeline',
      content: [
        'We offer multiple refund options to ensure convenience. The refund timeline depends on the payment method used during purchase.',
        'All refunds are processed after successful quality inspection of the returned product.',
      ],
      list: [
        'Original Payment Method: 7-10 business days (recommended)',
        'Bank Transfer: 5-7 business days',
        'Cashmitra Wallet: Instant credit upon approval',
        'Store Credit: Instant credit with 5% bonus value',
        'Cash (for in-store purchases): Available at partner stores within 3 days',
        'UPI: 3-5 business days',
      ],
      important:
        'Refund timeline starts from the date of quality check approval, not from the date of return initiation.',
    },
    {
      id: 'partial-refunds',
      title: '6. Partial Refunds and Deductions',
      content: [
        'In certain cases, we may issue partial refunds instead of full refunds. This happens when the returned device does not meet our eligibility criteria but is still acceptable for return.',
        'Deductions are made transparently and communicated to you before final processing.',
      ],
      list: [
        'Minor scratches or cosmetic damage: 5-10% deduction',
        'Missing accessories (non-essential): Deduction based on accessory value',
        'Opened sealed accessories: 20-30% deduction',
        'Damaged packaging: 5% deduction',
        'Late return (8-10 days): 10% restocking fee',
        'Missing invoice/receipt: 5% deduction (if verified through other means)',
      ],
      warning:
        'If the device is found to be in significantly worse condition than described, we reserve the right to reject the return or propose a revised refund amount.',
    },
    {
      id: 'replacement',
      title: '7. Replacement Policy',
      content: [
        'For defective products or devices with manufacturing defects, we offer direct replacement instead of refund.',
        'Replacements are subject to product availability and quality check verification.',
      ],
      list: [
        'Manufacturing defects: Free replacement within 7 days',
        'Dead on Arrival (DOA): Immediate replacement within 48 hours',
        'Same model replacement guaranteed (or equivalent/better model)',
        'Replacement pickup and delivery free of charge',
        'Replacement warranty starts from new delivery date',
        'Up to 2 replacement attempts before refund option',
        'Replacement processed faster than refunds (3-5 days)',
      ],
      important:
        "Replacement option is available only for defective or damaged products, not for change of mind or buyer's remorse.",
    },
    {
      id: 'defective-products',
      title: '8. Defective or Damaged Products',
      content: [
        'If you receive a defective or damaged product, please report it immediately for the fastest resolution.',
        'We take full responsibility for shipping damage and manufacturing defects.',
      ],
      list: [
        'Report defects within 48 hours of delivery',
        'Provide clear photos/videos of the defect or damage',
        'No return shipping charges for defective products',
        'Priority processing for defect-related returns',
        'Option to choose between replacement or full refund',
        'Compensation for inconvenience on a case-by-case basis',
        'Extended return window (up to 14 days) for hidden defects',
      ],
      important:
        'For DOA (Dead on Arrival) devices, contact us immediately at support@cashmitra.com or call +91 9876543210 for priority assistance.',
    },
    {
      id: 'seller-devices',
      title: '9. Returns for Devices You Sold to Us',
      content: [
        'This section applies to customers who sold their devices to Cashmitra and later changed their mind.',
        'Once a device is sold and payment is completed, the transaction is final. However, we understand special circumstances may arise.',
      ],
      list: [
        'Sold devices cannot be returned after payment completion',
        'Grace period of 24 hours before device is processed',
        'Buyback cancellation fee: 10% of quoted price',
        'Device must still be in our possession (not yet processed)',
        'Refund of received payment minus cancellation fee',
        'Maximum 1 cancellation per customer per year',
        'Cancellation requests must be made via customer support',
      ],
      warning:
        'Once a device is processed, refurbished, or sold to another customer, buyback cancellation is no longer possible under any circumstances.',
    },
    {
      id: 'shipping-charges',
      title: '10. Return Shipping and Pickup',
      content: [
        'We offer free return pickup for most returns. However, shipping charges may apply in certain situations.',
        'Our logistics partners will handle the pickup and ensure safe transit of your returned device.',
      ],
      list: [
        'Free return pickup for defective/damaged products',
        'Free pickup for manufacturing defect returns',
        'Customer pays return shipping for change of mind returns: ₹99-₹199',
        'Return pickup scheduled within 24-48 hours of approval',
        'Packaging material provided free for defective returns',
        'Pickup rescheduling allowed once without charges',
        'Insurance coverage included for all return shipments',
      ],
      important:
        'For remote areas, return pickup may take 3-5 business days. We recommend using our authorized logistics partners for safe returns.',
    },
    {
      id: 'cancellation',
      title: '11. Order Cancellation Policy',
      content: [
        'You can cancel your order before it is shipped without any charges. Once shipped, standard return policy applies.',
        'Cancellations are processed instantly if requested before order dispatch.',
      ],
      list: [
        'Free cancellation before order dispatch',
        'Instant refund to original payment method',
        'Cancellation via "My Orders" section or customer support',
        'Partial cancellation available for multi-item orders',
        'Once shipped, return policy applies (no direct cancellation)',
        'Auto-cancellation after 7 days of non-delivery attempts',
        'Email confirmation sent for all cancellations',
      ],
    },
    {
      id: 'exceptions',
      title: '12. Special Cases and Exceptions',
      content: [
        'We understand that exceptional circumstances may require flexibility in our return policy.',
        'The following cases will be reviewed on an individual basis by our customer support team.',
      ],
      list: [
        'Medical emergencies preventing timely return',
        'Incorrect product delivered (wrong model/variant)',
        'Technical issues preventing return initiation',
        'Multiple defects in replacement devices',
        'Extended warranty claims beyond 7-day window',
        'Force majeure events (natural disasters, lockdowns)',
        'Legal or regulatory issues with the device',
      ],
      important:
        'For special cases, please contact our customer support team with detailed information and supporting documents for review.',
    },
    {
      id: 'contact',
      title: '13. Contact for Returns Support',
      content: [
        'Need help with a return? Our dedicated returns support team is here to assist you:',
        'We aim to respond to all return inquiries within 24 hours.',
      ],
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-12">
      {sections.map(section => (
        <div
          key={section.id}
          id={section.id}
          className="scroll-mt-24 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border-2 border-grey-100 hover:shadow-xl transition-all duration-300"
        >
          {/* Section Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-grey-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gradient-to-r from-primary-500 to-accent-500">
            {section.title}
          </h2>

          {/* Content Paragraphs */}
          {section.content && (
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {section.content.map((paragraph, idx) => (
                <p key={idx} className="text-sm sm:text-base text-grey-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* List Items */}
          {section.list && (
            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {section.list.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-grey-700"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Process Steps (Special for Return Process) */}
          {section.steps && (
            <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
              {section.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="relative bg-gradient-to-br from-grey-50 to-white rounded-xl p-4 sm:p-6 border-2 border-grey-100 hover:shadow-lg transition-all duration-300"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -left-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-base sm:text-lg font-bold text-white">{step.number}</span>
                  </div>

                  {/* Step Content */}
                  <div className="ml-6 sm:ml-8">
                    <h4 className="text-base sm:text-lg font-bold text-grey-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-grey-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Important Note */}
          {section.important && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-1">
                    Important
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-800">{section.important}</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning Note */}
          {section.warning && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-red-900 mb-1">Warning</h4>
                  <p className="text-xs sm:text-sm text-red-800">{section.warning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Section (Special Case) */}
          {section.id === 'contact' && (
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
              {/* Email Card */}
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 sm:p-6 border-2 border-primary-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-grey-900">Returns Email</h4>
                </div>
                <p className="text-xs sm:text-sm text-grey-600 mb-2">
                  For return and refund inquiries:
                </p>
                <a
                  href="mailto:returns@cashmitra.com"
                  className="text-sm sm:text-base text-primary-600 font-semibold hover:underline"
                >
                  returns@cashmitra.com
                </a>
              </div>

              {/* Phone Card */}
              <div className="bg-gradient-to-br from-accent-50 to-white rounded-xl p-4 sm:p-6 border-2 border-accent-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-grey-900">Helpline</h4>
                </div>
                <p className="text-xs sm:text-sm text-grey-600 mb-2">Call us for urgent returns:</p>
                <a
                  href="tel:+919876543210"
                  className="text-sm sm:text-base text-accent-600 font-semibold hover:underline"
                >
                  +91 9876543210
                </a>
                <p className="text-xs text-grey-500 mt-2">Mon-Sun: 9AM - 9PM</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Final Summary Notice */}
      <div className="bg-gradient-to-br from-grey-900 to-grey-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-white shadow-xl">
        <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-primary-400 mx-auto mb-4" />
        <h3 className="text-xl sm:text-2xl text-white font-bold mb-3 sm:mb-4">
          Your Satisfaction Guaranteed
        </h3>
        <p className="text-sm sm:text-base text-grey-300 max-w-2xl mx-auto leading-relaxed">
          We stand behind the quality of our products. If you're not 100% satisfied with your
          purchase, our easy return process ensures you get a hassle-free resolution. Shop with
          confidence at Cashmitra.
        </p>
        <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
          <span className="text-xs sm:text-sm font-semibold">7-Day Return Guarantee</span>
        </div>
      </div>
    </div>
  );
};

export default ReturnsContent;

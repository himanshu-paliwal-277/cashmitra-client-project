import { Star } from 'lucide-react';
import React from 'react';

const testimonials = [
  {
    id: 1,
    text: 'Sold my iPhone 12 in just 2 hours! The process was so smooth and the price was better than other platforms.',
    author: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    avatar: 'PS',
  },
  {
    id: 2,
    text: 'Great experience selling my MacBook. The pickup was on time and payment was instant. Highly recommended!',
    author: 'Rahul Kumar',
    location: 'Delhi',
    rating: 5,
    avatar: 'RK',
  },
  {
    id: 3,
    text: 'Trustworthy platform with verified partners. Got the exact quoted price for my Samsung Galaxy.',
    author: 'Anita Patel',
    location: 'Bangalore',
    rating: 5,
    avatar: 'AP',
  },
];

const Testimonial: React.FC = () => {
  return (
    <section className="py-8 sm:py-20 bg-white main-container">
      <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-gray-900">
        What our customers say
      </h2>
      <p className="text-md sm:text-lg text-gray-600 text-center mb-12 max-w-[600px] mx-auto">
        Join thousands of satisfied customers who have sold their devices through Cashmitra
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {testimonials.map(testimonial => (
          <div
            key={testimonial.id}
            className="bg-white border border-gray-200 rounded-md sm:rounded-xl sm:p-6 p-3 shadow-sm sm:hover:shadow-lg transition-shadow"
          >
            <div className="flex gap-1 mb-3 text-yellow-500">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>

            <p className="italic mb-4 leading-relaxed text-gray-700 sm:text-md text-xs">
              "{testimonial.text}"
            </p>

            <div className="flex items-center gap-3">
              <div className="text-xs sm:text-md sm:w-12 sm:h-12 h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {testimonial.avatar}
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900 m-0">
                  {testimonial.author}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 m-0">{testimonial.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonial;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';

const BreadcrumbNav = () => {
  const location = useLocation();

  const generateBreadcrumbPath = () => {
    const query = new URLSearchParams(location.search);
    const pathSegments = [
      { 
        name: 'Home', 
        icon: <FaHome className="mr-1.5 text-[#4C0ADA]" />,
        link: '/' 
      },
      {
        name: query.get('category'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}`
      },
      {
        name: query.get('group'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}&group=${encodeURIComponent(query.get('group') || '')}`
      },
      {
        name: query.get('item'),
        link: `?category=${encodeURIComponent(query.get('category') || '')}&group=${encodeURIComponent(query.get('group') || '')}&item=${encodeURIComponent(query.get('item') || '')}`
      }
    ].filter(segment => segment.name);

    return (
      <nav className="flex items-center mb-6">
        <ol className="flex items-center space-x-1">
          {pathSegments.map((segment, index) => (
            <React.Fragment key={index}>
              <li className="flex items-center">
                {index === 0 ? (
                  <Link 
                    to={segment.link} 
                    className="flex items-center text-[#4C0ADA] hover:text-[#3A0AA5] transition-colors font-medium"
                  >
                    {segment.icon}
                    <span>{segment.name}</span>
                  </Link>
                ) : index === pathSegments.length - 1 ? (
                  <span className="text-gray-600 flex items-center">
                    <FaChevronRight className="mx-2 text-gray-400 text-xs" />
                    <span className="font-semibold text-gray-800">{segment.name}</span>
                  </span>
                ) : (
                  <Link 
                    to={segment.link} 
                    className="flex items-center text-gray-600 hover:text-[#4C0ADA] transition-colors"
                  >
                    <FaChevronRight className="mx-2 text-gray-400 text-xs" />
                    <span>{segment.name}</span>
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    );
  };

  return generateBreadcrumbPath();
};

export default BreadcrumbNav;
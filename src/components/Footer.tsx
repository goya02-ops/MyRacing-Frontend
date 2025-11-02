import React from 'react';
import {
  facebook,
  instagram,
  twitter,
  github,
  dribbble,
} from '../assets/logosSocialMedia.ts';

const Footer: React.FC = () => {
  return (
    <section className="text-gray-400 bg-gray-900/50 backdrop-blur-lg body-font border-t border-gray-800/50">
      <div className="container flex flex-col items-center px-8 py-8 mx-auto max-w-7xl sm:flex-row">
        <a
          href="#"
          className="text-xl font-black leading-none text-gray-200 select-none"
        >
          MyRacing<span className="text-orange-500">.</span>
        </a>
        <p className="mt-4 text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l sm:border-gray-700/50 sm:mt-0">
          © 2025 MyRacing Stats - Race Analytics Platform
        </p>
        <span className="inline-flex justify-center mt-4 space-x-5 sm:ml-auto sm:mt-0 sm:justify-start">
          <SocialIcon name="Facebook" />
          <SocialIcon name="Instagram" />
          <SocialIcon name="Twitter" />
          <SocialIcon name="GitHub" />
          <SocialIcon name="Dribbble" />
        </span>
      </div>
    </section>
  );
};

const SocialIcon: React.FC<{ name: string }> = ({ name }) => {
  const getIcon = () => {
    switch (name) {
      case 'Facebook':
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d={`${facebook}`} clipRule="evenodd" />
          </svg>
        );
      case 'Instagram':
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d={`${instagram}`} clipRule="evenodd" />
          </svg>
        );
      case 'Twitter':
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d={`${twitter}`} />
          </svg>
        );
      case 'GitHub':
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d={`${github}`} clipRule="evenodd" />
          </svg>
        );
      case 'Dribbble':
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d={`${dribbble}`} clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span className="text-gray-400 hover:text-gray-300 cursor-pointer">
      <span className="sr-only">{name}</span>
      {getIcon()}
    </span>
  );
};

export { Footer };

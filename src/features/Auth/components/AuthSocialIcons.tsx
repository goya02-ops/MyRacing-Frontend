import React from 'react';
import { RiGoogleFill, RiFacebookFill, RiGithubFill, RiLinkedinFill } from '@remixicon/react';

const SocialIcon = ({ icon: Icon }: { icon: React.ElementType }) => (
  <a
    href="#"
    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700/50 text-gray-400 transition-all hover:border-orange-500/50 hover:text-orange-400"
  >
    <Icon className="h-5 w-5" />
  </a>
);

export const AuthSocialIcons = () => (
  <div className="my-2 flex gap-4">
    <SocialIcon icon={RiGoogleFill} />
    <SocialIcon icon={RiFacebookFill} />
    <SocialIcon icon={RiGithubFill} />
    <SocialIcon icon={RiLinkedinFill} />
  </div>
);
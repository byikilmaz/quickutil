'use client';
import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref"> & {
    title?: string | undefined;
    titleId?: string | undefined;
  } & RefAttributes<SVGSVGElement>>;
  color: string;
  href: string;
  badge?: string;
}

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link href={tool.href} className="group">
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300 group-hover:scale-105 overflow-hidden">
        {/* Hover gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge */}
        {tool.badge && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            {tool.badge}
          </div>
        )}
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${tool.color} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Icon 
                className="h-8 w-8 relative z-10 group-hover:scale-110 transition-transform duration-300" 
                aria-label={`${tool.title} aracı ikonu`}
                role="img"
              />
            </div>
            <ArrowRightIcon 
              className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300" 
              aria-hidden="true"
            />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {tool.title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-gray-700 transition-colors duration-300">
            {tool.description}
          </p>
          
          <div className="flex items-center text-sm text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
            <span>Başlayın</span>
            <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
} 
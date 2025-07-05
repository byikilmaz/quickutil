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
}

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link href={tool.href} className="group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group-hover:scale-105">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${tool.color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {tool.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {tool.description}
        </p>
        
        <div className="mt-4 flex items-center text-sm text-blue-600 font-medium group-hover:text-blue-700">
          <span>Başlayın</span>
          <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
} 
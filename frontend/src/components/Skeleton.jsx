import React from 'react';

export const Shimmer = ({ className }) => (
  <div className={`shimmer dark:shimmer shimmer-light rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 p-6 space-y-4">
    <div className="flex justify-between items-center">
      <Shimmer className="h-4 w-16" />
      <Shimmer className="h-4 w-12" />
    </div>
    <Shimmer className="h-6 w-3/4" />
    <Shimmer className="h-4 w-full" />
    <Shimmer className="h-4 w-5/6" />
    <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-900">
      <Shimmer className="h-6 w-6 rounded-full" />
      <Shimmer className="h-3 w-20" />
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4 h-[240px] flex flex-col justify-between">
    <Shimmer className="h-4 w-1/3" />
    <div className="flex items-end justify-between space-x-2 flex-grow pt-4">
      <Shimmer className="h-[20%] w-full" />
      <Shimmer className="h-[45%] w-full" />
      <Shimmer className="h-[30%] w-full" />
      <Shimmer className="h-[75%] w-full" />
      <Shimmer className="h-[50%] w-full" />
      <Shimmer className="h-[90%] w-full" />
      <Shimmer className="h-[60%] w-full" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-8">
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
      <Shimmer className="h-20 w-20 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-grow">
        <Shimmer className="h-6 w-1/3" />
        <Shimmer className="h-4 w-1/4" />
        <Shimmer className="h-4 w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4">
          <Shimmer className="h-5 w-1/2" />
          <div className="flex flex-wrap gap-2">
            <Shimmer className="h-6 w-12" />
            <Shimmer className="h-6 w-16" />
            <Shimmer className="h-6 w-14" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4">
          <Shimmer className="h-5 w-1/3" />
          <Shimmer className="h-16 w-full" />
          <Shimmer className="h-16 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="space-y-4 h-[400px] flex flex-col justify-end">
    <div className="flex space-x-2 items-start max-w-[70%]">
      <Shimmer className="h-7 w-7 rounded-full flex-shrink-0" />
      <div className="space-y-1">
        <Shimmer className="h-3 w-12" />
        <Shimmer className="h-8 w-44 rounded-2xl rounded-tl-none" />
      </div>
    </div>
    <div className="flex space-x-2 items-start max-w-[70%] self-end">
      <div className="space-y-1 items-end flex flex-col">
        <Shimmer className="h-3 w-12" />
        <Shimmer className="h-12 w-60 rounded-2xl rounded-tr-none" />
      </div>
      <Shimmer className="h-7 w-7 rounded-full flex-shrink-0" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4">
        <Shimmer className="h-6 w-1/3" />
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-2 w-full mt-6" />
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4">
        <Shimmer className="h-5 w-1/2" />
        <Shimmer className="h-10 w-full" />
        <Shimmer className="h-10 w-full" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex items-center space-x-4">
        <Shimmer className="h-10 w-10 rounded-xl" />
        <div className="space-y-1">
          <Shimmer className="h-3 w-14" />
          <Shimmer className="h-5 w-10" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex items-center space-x-4">
        <Shimmer className="h-10 w-10 rounded-xl" />
        <div className="space-y-1">
          <Shimmer className="h-3 w-14" />
          <Shimmer className="h-5 w-10" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex items-center space-x-4">
        <Shimmer className="h-10 w-10 rounded-xl" />
        <div className="space-y-1">
          <Shimmer className="h-3 w-14" />
          <Shimmer className="h-5 w-10" />
        </div>
      </div>
    </div>
  </div>
);

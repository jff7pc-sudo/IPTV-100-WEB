/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavBar } from '../components/TopNavBar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <TopNavBar />
      <main className="flex-1 p-6 max-w-[1920px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavBar } from '../components/TopNavBar';

export const MainLayout: React.FC = () => {
  return (
    <div className="h-screen bg-black text-white pt-20 overflow-hidden">
      <TopNavBar />
      <main className="h-full p-12 max-w-[1920px] mx-auto overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

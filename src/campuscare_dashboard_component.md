# CampusCare Grievance Queue UI Component

This document provides a complete React (JSX) implementation of the **CampusCare Admin Grievance Queue** page shown in the target design.

## Overview

The interface is built using standard React state hooks and Tailwind CSS. It recreates the UI components visible in the image, including:

1. **Left Sidebar Navigation:** Brand logo (`CampusCare WMSU ADMIN`), active section highlights, and icons for sections like *Live Grievances*, *Grievance Queue*, *Departments*, *Web Analytics*, etc.
2. **Top Header Bar:** Search input, status indicator (`Intake Open`), notification bell, and user profile (`OSAS Officer`).
3. **Filter Tabs & Date Picker:** Navigation tabs for sorting cases (`All Cases (24)`, `Under Review`, `In Progress`, etc.) and date range selector.
4. **Interactive Data Table:**
   - Case ID, Filer avatar/info (supporting anonymous filers with privacy icons).
   - Category tags and color-coded SLA countdown indicators.
   - Assigned desk tags and status badges.
   - **Interactive Action Menu:** Clicking the action menu trigger (`⋮`) on any row displays the contextual popup containing **Message**, **Reassign**, and **Resolve** options.

---

## React Code (`GrievanceQueue.jsx`)

```jsx
import React, { useState } from 'react';
import {
  Radio,
  Inbox,
  Building2,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Search,
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  MoreVertical,
  ShieldAlert,
  Lock,
  MessageCircle,
  UserPlus,
  Check
} from 'lucide-react';

const mockCases = [
  {
    id: '#2632',
    filer: 'C. Sailela',
    avatar: 'CS',
    avatarBg: 'bg-slate-200 text-slate-700',
    category: 'Facilities & Plant',
    sla: '22 hrs left',
    slaStatus: 'normal',
    assignedDesk: 'CPPO Facilities',
    status: 'In Progress',
    statusColor: 'text-blue-600 bg-blue-50',
    dotColor: 'bg-blue-600',
    type: 'Campus Lab'
  },
  {
    id: '#2631',
    filer: 'Anonymous Student',
    avatar: <ShieldAlert className="w-4 h-4 text-rose-500" />,
    avatarBg: 'bg-rose-100',
    category: 'Academic Affairs',
    sla: '5 hrs left',
    slaStatus: 'urgent',
    assignedDesk: 'College of Eng.',
    status: 'Urgent Review',
    statusColor: 'text-rose-600 bg-rose-50',
    dotColor: 'bg-rose-600',
    type: 'Midterm Clearance'
  },
  {
    id: '#2630',
    filer: 'J. Dela Cruz',
    avatar: 'JD',
    avatarBg: 'bg-blue-100 text-blue-700',
    category: 'Financial Aid',
    sla: '31 hrs left',
    slaStatus: 'normal',
    assignedDesk: 'UniFAST Unit',
    status: 'Under Review',
    statusColor: 'text-amber-600 bg-amber-50',
    dotColor: 'bg-amber-500',
    type: 'TES'
  },
  {
    id: '#2629',
    filer: 'Anonymous Student',
    avatar: <Lock className="w-4 h-4 text-amber-600" />,
    avatarBg: 'bg-amber-100',
    category: 'Student Conduct',
    sla: '26 hrs left',
    slaStatus: 'normal',
    assignedDesk: 'OSAS Discipline',
    status: 'Under Review',
    statusColor: 'text-amber-600 bg-amber-50',
    dotColor: 'bg-amber-500',
    type: 'Peer Bullying'
  },
  {
    id: '#2628',
    filer: 'R. Tan',
    avatar: 'RT',
    avatarBg: 'bg-purple-100 text-purple-700',
    category: 'IT Services',
    sla: '13 hrs left',
    slaStatus: 'normal',
    assignedDesk: 'CCICT Systems',
    status: 'In Progress',
    statusColor: 'text-blue-600 bg-blue-50',
    dotColor: 'bg-blue-600',
    type: 'Portal Token'
  },
  {
    id: '#2627',
    filer: 'M. Lim',
    avatar: 'ML',
    avatarBg: 'bg-emerald-100 text-emerald-700',
    category: 'Advising & Records',
    sla: 'Turnaround Met',
    slaStatus: 'resolved',
    assignedDesk: 'Registrar Desk',
    status: 'Resolved',
    statusColor: 'text-emerald-600 bg-emerald-50',
    dotColor: 'bg-emerald-600',
    type: 'TOR Certification'
  }
];

export default function GrievanceQueue() {
  const [activeTab, setActiveTab] = useState('All Cases');
  const [openMenuId, setOpenMenuId] = useState('#2631'); // Default open menu as seen in image

  const navItems = [
    { label: 'Live Grievances', icon: Radio },
    { label: 'Grievance Queue', icon: Inbox, active: true },
    { label: 'Departments', icon: Building2 },
    { label: 'SLA Analytics', icon: BarChart3 },
    { label: 'Student Filers', icon: Users },
    { label: 'Direct Notices', icon: MessageSquare },
    { label: 'Settings', icon: Settings }
  ];

  const tabs = [
    { label: 'All Cases', count: 24 },
    { label: 'Under Review' },
    { label: 'In Progress' },
    { label: 'Urgent Escalations' },
    { label: 'Resolved' }
  ];

  return (
    <div className="flex h-screen bg-slate-100 text-slate-700 font-sans p-4">
      {/* Container Card */}
      <div className="flex flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-100 p-6 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-base leading-tight">CampusCare</h1>
                <p className="text-xs text-slate-400 tracking-wider">WMSU ADMIN</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-rose-50 text-rose-600 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.active ? 'text-rose-500' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          
          {/* Top Bar Header */}
          <header className="px-8 py-5 flex items-center justify-between border-b border-slate-100">
            {/* Search Input */}
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket #, filer, or topic..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>

            {/* User Controls */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span>Intake Open</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>

              <button className="relative text-slate-400 hover:text-slate-600">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500"></span>
              </button>

              <div className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center">
                  img
                </div>
                <span className="text-sm font-semibold text-slate-800">OSAS Officer</span>
                <span className="text-slate-400 text-xs">▼</span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Grievance Queue</h2>

            {/* Filter Tabs & Date Filter */}
            <div className="flex items-center justify-between border-b border-slate-200 mb-6">
              <div className="flex items-center gap-6">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.label;
                  return (
                    <button
                      key={tab.label}
                      onClick={() => setActiveTab(tab.label)}
                      className={`pb-3 text-sm font-medium transition-all relative ${
                        isActive ? 'text-rose-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label} {tab.count && `(${tab.count})`}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Date Selector */}
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Oct 01, 2025</span>
                <span className="text-slate-400 uppercase text-[10px]">TO</span>
                <span>Oct 25, 2025</span>
                <span className="text-slate-400 ml-1">▼</span>
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-visible">
              <table className="w-full text-left text-xs border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-3">Id ▼</th>
                    <th className="py-3 px-3">Filer Info</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">SLA Time Remaining ▼</th>
                    <th className="py-3 px-3">Assigned Desk</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCases.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors rounded-xl relative ${
                        item.slaStatus === 'urgent' ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-4 px-3 font-bold text-slate-800">{item.id}</td>

                      {/* Filer Info */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs ${item.avatarBg}`}
                          >
                            {item.avatar}
                          </div>
                          <span className="font-medium text-slate-700">{item.filer}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-3 text-slate-500">{item.category}</td>

                      {/* SLA Time Remaining */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 font-medium">
                          {item.slaStatus === 'resolved' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Clock
                              className={`w-4 h-4 ${
                                item.slaStatus === 'urgent' ? 'text-rose-500' : 'text-slate-400'
                              }`}
                            />
                          )}
                          <span
                            className={
                              item.slaStatus === 'urgent'
                                ? 'text-rose-600 font-semibold'
                                : item.slaStatus === 'resolved'
                                ? 'text-emerald-600'
                                : 'text-slate-600'
                            }
                          >
                            {item.sla}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Desk */}
                      <td className="py-4 px-3">
                        <span
                          className={`font-semibold ${
                            item.slaStatus === 'urgent' ? 'text-slate-700' : 'text-rose-700'
                          }`}
                        >
                          {item.assignedDesk}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></span>
                          <span className={item.statusColor.split(' ')[0]}>{item.status}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-3 text-slate-500">{item.type}</td>

                      {/* Action Button & Popover Menu */}
                      <td className="py-4 px-3 text-right relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Popover Menu */}
                        {openMenuId === item.id && (
                          <div className="absolute right-3 top-10 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-20 text-left space-y-1">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 rounded-xl font-medium transition-colors">
                              <MessageCircle className="w-3.5 h-3.5" />
                              Message
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors">
                              <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                              Reassign
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-colors">
                              <Check className="w-3.5 h-3.5" />
                              Resolve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## Dependencies Setup

To run this component in your React project, make sure to install Tailwind CSS and **Lucide React** icon library:

```bash
npm install lucide-react
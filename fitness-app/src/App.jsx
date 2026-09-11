import { useState } from 'react';
import TodayTab from './components/TodayTab.jsx';
import MealsTab from './components/MealsTab.jsx';
import WeightTab from './components/WeightTab.jsx';
import PhotosTab from './components/PhotosTab.jsx';
import GymTab from './components/GymTab.jsx';
import SettingsTab from './components/SettingsTab.jsx';
import {
  IconHome,
  IconMeals,
  IconWeight,
  IconPhoto,
  IconGym,
  IconSettings,
} from './components/icons.jsx';

const TABS = [
  { id: 'today', label: 'Today', icon: IconHome, Component: TodayTab },
  { id: 'meals', label: 'Meals', icon: IconMeals, Component: MealsTab },
  { id: 'weight', label: 'Weight', icon: IconWeight, Component: WeightTab },
  { id: 'photos', label: 'Photos', icon: IconPhoto, Component: PhotosTab },
  { id: 'gym', label: 'Gym', icon: IconGym, Component: GymTab },
  { id: 'settings', label: 'Settings', icon: IconSettings, Component: SettingsTab },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [refreshTick, setRefreshTick] = useState(0);
  const bump = () => setRefreshTick((t) => t + 1);

  const active = TABS.find((t) => t.id === activeTab);
  const ActiveComponent = active.Component;

  return (
    <div className="app">
      <div className="screen">
        <ActiveComponent
          refreshTick={refreshTick}
          onDataChange={bump}
          goToTab={setActiveTab}
        />
      </div>

      <nav className="bottom-nav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-btn${tab.id === activeTab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

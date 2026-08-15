import React from 'react';
import { Joyride, STATUS, EVENTS } from 'react-joyride';

const CustomTooltip = ({
  index,
  step,
  backProps,

  primaryProps,
  tooltipProps,
  isLastStep,
  size,
  onImportClick,
  skipProps
}) => {
  return (
    <div
      {...tooltipProps}
      style={{
        backgroundColor: '#191b23',
        borderRadius: '12px',
        padding: '20px',
        width: '320px',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
        <span>{index + 1} of {size}</span>
        <button
          {...skipProps}
          title=""
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
        >
          Skip tour
        </button>
      </div>

      {/* Title */}
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{step.title}</h3>

      {/* Content */}
      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
        {step.content}
      </div>

      {/* Custom Content for Step 7 */}
      {index === 6 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={(e) => {
              onImportClick();
              primaryProps.onClick(e); // Proceed to next step automatically
            }}
            style={{
              backgroundColor: '#3b82f6', // Bright blue
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Import bookmarks
          </button>
          <button
            {...primaryProps}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            Maybe later
          </button>
        </div>
      )}

      {/* Custom Content for Step 8 (Drag Animation) */}
      {index === 7 && (
        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
          <svg width="140" height="60" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Board 1 */}
            <rect x="0" y="0" width="60" height="60" rx="6" fill="#292c36" />
            <rect x="8" y="8" width="12" height="12" rx="2" fill="#475569" />
            <rect x="24" y="12" width="28" height="4" rx="2" fill="#475569" />
            <rect x="8" y="28" width="12" height="12" rx="2" fill="#475569" />
            <rect x="24" y="32" width="28" height="4" rx="2" fill="#475569" />
            
            {/* Board 2 */}
            <rect x="80" y="0" width="60" height="60" rx="6" fill="#292c36" />
            <rect x="88" y="8" width="12" height="12" rx="2" fill="#475569" />
            <rect x="104" y="12" width="28" height="4" rx="2" fill="#475569" />
            
            {/* Dragging Item */}
            <g className="tour-drag-anim">
              <rect x="18" y="24" width="48" height="20" rx="4" fill="#3b82f6" opacity="0.9" />
              <rect x="22" y="28" width="8" height="8" rx="2" fill="#ffffff" />
              <rect x="34" y="30" width="24" height="4" rx="2" fill="#ffffff" />
            </g>
            
            <style>
              {`
                @keyframes dragAnim {
                  0% { transform: translate(0px, 0px); opacity: 1; }
                  40% { transform: translate(70px, 16px); opacity: 1; }
                  50% { transform: translate(70px, 16px); opacity: 0; }
                  51% { transform: translate(0px, 0px); opacity: 0; }
                  100% { transform: translate(0px, 0px); opacity: 1; }
                }
                .tour-drag-anim {
                  animation: dragAnim 2s infinite ease-in-out;
                }
              `}
            </style>
          </svg>
        </div>
      )}

      {/* Footer (Buttons) */}
      {index !== 6 && ( // Hide footer on Step 7 because it has its own buttons
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          {index > 0 && (
            <button
              {...backProps}
              title=""
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          )}
          <button
            {...primaryProps}
            title=""
            style={{
              backgroundColor: '#0ea5e9', // Ocean blue from images
              color: 'white',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {isLastStep ? 'Done' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default function TourGuide({ onComplete, onImportClick }) {
  const steps = [
    {
      target: '.placeholder-board',
      content: 'Boards hold your bookmarks. Click any highlighted "+" slot to create your first one.',
      title: 'Create a board',
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: 'body',
      content: 'Once you have a board, click the + on it to save any link.',
      title: 'Add a bookmark',
      placement: 'center',
    },
    {
      target: '.tabs-container',
      content: 'Create pages for Work, Personal, Travel, or whatever makes sense for you.',
      title: 'Organize with pages',
      placement: 'bottom',
    },
    {
      target: '.fab[title="Menu"]',
      content: 'Change your wallpaper, add widgets, or import your Chrome bookmarks.',
      title: 'Explore the menu',
      placement: 'left',
    },
    {
      target: '.fab-primary[title="Settings"]',
      content: 'Account, board layout, and everything in between, all in one place.',
      title: 'Settings',
      placement: 'left',
    },
    {
      target: 'body',
      content: 'Click the bashaMark icon in the toolbar to save the current tab. You can also set up a keyboard shortcut in Settings.',
      title: 'Save any page in a click',
      placement: 'center',
    },
    {
      target: 'body',
      content: "Let's import your existing Chrome bookmarks into boards. It only takes a click.",
      title: 'Bring in your bookmarks',
      placement: 'center',
    },
    {
      target: 'body',
      content: 'Drag any bookmark to move it between boards, or reorder it within a board.',
      title: 'Drag to organize',
      placement: 'center',
    },
    {
      target: 'body',
      content: "That's all you need to know. Go ahead and make it yours.",
      title: "You're all set!",
      placement: 'center',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || type === EVENTS.TOUR_END) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={true}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={false}
      showSkipButton={true}
      disableOverlayClose={true}
      disableScrolling={true}
      spotlightPadding={4}
      tooltipComponent={(props) => <CustomTooltip {...props} onImportClick={onImportClick} />}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: '#191b23',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.45)', // Slight dim
        }
      }}
    />
  );
}


'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useState } from 'react';

export function SofascoreWidget() {
  const [widgetSrc, setWidgetSrc] = useState('');

  useEffect(() => {
    const config = {
      "widget": "standings",
      "host": "widgets.sofascore.com",
      "tournament": "3830",
      "season": "79701",
      "showCompetitionLogo": true,
      "theme": "dark", // Change theme to dark
    };
    
    const queryString = new URLSearchParams(config as any).toString();
    setWidgetSrc(`https://widgets.sofascore.com/embed/tournament/3830/season/79701/standings/Premiership%2025%2F26?${queryString}`);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">Standings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <iframe 
            id="sofa-standings-embed-3830-79701" 
            src={widgetSrc}
            style={{ 
                height: '500px', 
                maxWidth: '768px', 
                width: '100%' 
            }} 
            frameBorder="0" 
            scrolling="no"
            title="Sofascore Standings"
        >
        </iframe>
        <div style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif', textAlign: 'left', padding: '10px' }}>
          Standings provided by <a target="_blank" href="https://www.sofascore.com/tournament/football/south-africa/premiership/358#id:79701" rel="noopener noreferrer">Sofascore</a>
        </div>
      </CardContent>
    </Card>
  );
}

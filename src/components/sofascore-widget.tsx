'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function SofascoreWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">Standings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <iframe 
            id="sofa-standings-embed-3830-79701" 
            src="https://widgets.sofascore.com/embed/tournament/3830/season/79701/standings/Premiership%2025%2F26?widgetTitle=Premiership%2025%2F26&showCompetitionLogo=true" 
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

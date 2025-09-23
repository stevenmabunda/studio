
'use client';

import Image from 'next/image';
import { Card } from './ui/card';

export function BettingOddsWidget() {
    return (
        <div className="p-4 flex flex-col items-center gap-4">
            <div className="w-full relative h-40 rounded-lg overflow-hidden shadow-lg">
                <Image
                    src="https://picsum.photos/seed/bet-ad/600/160"
                    alt="Advertisement"
                    fill
                    className="object-cover"
                    data-ai-hint="sports betting"
                />
            </div>
            <Card className="w-full overflow-hidden">
                <iframe
                    title="Sports Odds Widget"
                    style={{ 
                        width: '100%', 
                        height: '45rem', 
                        border: 'none', 
                        filter: 'invert(1)' 
                    }}
                    src="https://widget.the-odds-api.com/v1/sports/soccer_epl/events/?accessKey=wk_947c555b685fa995dc8cb809120b15fc&bookmakerKeys=draftkings&oddsFormat=decimal&markets=h2h%2Cspreads%2Ctotals&marketNames=h2h%3AMoneyline%2Cspreads%3ASpreads%2Ctotals%3AOver%2FUnder&theme=dark"
                ></iframe>
            </Card>
        </div>
    );
}

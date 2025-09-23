
'use client';

export function BettingOddsWidget() {
    return (
        <div className="p-4 flex justify-center">
            <iframe
                title="Sports Odds Widget"
                style={{ width: '100%', height: '45rem', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                src="https://widget.the-odds-api.com/v1/sports/soccer_epl/events/?accessKey=wk_947c555b685fa995dc8cb809120b15fc&bookmakerKeys=draftkings&oddsFormat=decimal&markets=h2h%2Cspreads%2Ctotals&marketNames=h2h%3AMoneyline%2Cspreads%3ASpreads%2Ctotals%3AOver%2FUnder"
            ></iframe>
        </div>
    );
}

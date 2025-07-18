
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Gem, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: 'Rising Star',
    price: 'Open to All',
    priceDetail: 'Entry-level Creators',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    icon: Star,
    eligibility: [
      '18+ years old',
      'At least 3 football-related posts/week',
      'Content is original & follows community guidelines',
      'Minimum 50 total engagements/month',
    ],
    perks: [
      'Creator Badge',
      'Chance to be featured on BHOLO homepage',
      'Mobile data or airtime rewards',
      'Access to creator tips & tools',
    ],
    featured: false,
  },
  {
    name: 'Pro Creator',
    price: 'For Consistent Creators',
    priceDetail: 'High-Impact',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary',
    textColor: 'text-primary',
    icon: Gem,
    eligibility: [
      'Meet Rising Star criteria',
      'At least 10 football posts/month',
      '1K+ monthly engagements or strong follower base',
      'Positive community rep (no bans or spam)',
    ],
    perks: [
      'Cash payouts (R250–R500 monthly)',
      'Pro Creator Badge',
      'Priority featuring in trending tabs',
      'Invitation to host watch-alongs',
      'Exclusive BHOLO merch drops',
    ],
    featured: true,
  },
  {
    name: 'Creator Ambassador',
    price: 'Invite Only',
    priceDetail: 'Top-tier content kings & queens',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: Crown,
    eligibility: [
      'Consistently top-performing Pro Creators',
      'Regularly spark debates, memes, fan love',
      'Represent a team, city, or fanbase on the app',
    ],
    perks: [
      'Premium cash rewards',
      'Collaboration on BHOLO Originals',
      'Social media shoutouts',
      'Host official live events or shows',
      'VIP invites to BHOLO parties & matches',
    ],
    featured: false,
  },
];

export default function CreatorsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              BHOLO Creator Program
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              From fan to football content king. Create content, build your community, and get rewarded.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card key={tier.name} className={cn(
                "flex flex-col border-2",
                tier.bgColor,
                tier.featured ? tier.borderColor : 'border-transparent'
              )}>
                <CardHeader className="text-center">
                  <tier.icon className={cn("h-10 w-10 mx-auto mb-4", tier.textColor)} />
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <p className="font-bold text-xl">{tier.price}</p>
                  <CardDescription>{tier.priceDetail}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Eligibility</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {tier.eligibility.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Perks</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {tier.perks.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                   <Button className={cn(!tier.featured && "bg-foreground/80 hover:bg-foreground")}>
                    {tier.name === 'Creator Ambassador' ? 'Get Noticed' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

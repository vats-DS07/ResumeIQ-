import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, HelpCircle, ShieldAlert, Sparkles, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const PricingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20">
      


      {/* Main Hero */}
      <section className="pt-28 pb-12 bg-surface/30">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-4">
          <Badge variant="primary">💎 Simple Plans</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text">
            Fair, Transparent Pricing
          </h1>
          <p className="text-base text-text-secondary max-w-lg leading-relaxed">
            Choose the plan that fits your career goal. Start optimizing today without any card upfront.
          </p>
        </div>
      </section>

      {/* Pricing Cards Comparison */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          
          {/* Free Tier Card */}
          <Card className="flex flex-col justify-between border-border bg-surface shadow-sm h-full hover:shadow-hover hover:-translate-y-0.5 transition-all">
            <CardContent className="pt-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest block mb-1">
                  Standard Plan
                </span>
                <h3 className="text-2xl font-extrabold text-text mb-4">Free Plan</h3>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-text">$0</span>
                  <span className="text-sm text-text-secondary font-medium">/ forever</span>
                </div>
                
                <p className="text-sm text-text-secondary leading-relaxed mb-6 border-b border-border pb-6">
                  Basic diagnostics scan to identify critical formatting bugs and tag checklist.
                </p>

                <ul className="flex flex-col gap-4 mb-8 text-left">
                  <li className="flex items-center gap-3 text-sm text-text">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>1 Resume upload & scan</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-text">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Formatting and length check</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-text">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Hard & soft skills extraction</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary opacity-50">
                    <X className="w-5 h-5 text-danger shrink-0" />
                    <span>Missing skills detection</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary opacity-50">
                    <X className="w-5 h-5 text-danger shrink-0" />
                    <span>AI Bullet Rewrites helper</span>
                  </li>
                </ul>
              </div>

              <Button variant="secondary" className="w-full font-bold shadow-sm" onClick={() => navigate('/signup')}>
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier Card */}
          <Card className="flex flex-col justify-between border-primary/50 bg-surface shadow-elevated h-full relative overflow-hidden hover:shadow-hover hover:-translate-y-0.5 transition-all">
            <div className="absolute right-0 top-0 bg-primary text-white text-xs uppercase font-extrabold tracking-widest px-4 py-1.5 rounded-bl-lg">
              Most Popular
            </div>
            
            <CardContent className="pt-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
                  Premium Audit
                </span>
                <h3 className="text-2xl font-extrabold text-text mb-4">Pro Plan</h3>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-text">$19</span>
                  <span className="text-sm text-text-secondary font-medium">/ month</span>
                </div>
                
                <p className="text-sm text-text-secondary leading-relaxed mb-6 border-b border-border pb-6">
                  Complete optimization scan with real-time AI context-matching and bullet rewrites.
                </p>

                <ul className="flex flex-col gap-4 mb-8 text-left">
                  <li className="flex items-center gap-3 text-sm text-text">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Unlimited resume scan uploads</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-text">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Custom Job Description comparison</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-text">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>AI Bullet Rewrites suggestions</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-text">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Missing tags matching checklists</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-text">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Professional PDF report downloads</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button disabled className="w-full font-bold shadow-md opacity-60">
                  Select Pro Plan
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary">
                  <Badge variant="amber" outline className="text-[10px] uppercase font-bold py-0.5">
                    Coming Soon
                  </Badge>
                  <span>Premium payments are launching shortly</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Feature Detailed Checklist table */}
      <section className="py-12 max-w-4xl mx-auto px-6 border-t border-border/50">
        <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">Compare Plan Features</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-bg/50 border-b border-border">
                <th className="p-4 font-semibold text-text">Feature</th>
                <th className="p-4 font-semibold text-text text-center">Free</th>
                <th className="p-4 font-semibold text-text text-center">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-4 font-medium text-text">Monthly Scan Uploads</td>
                <td className="p-4 text-center text-text-secondary">1 Resume</td>
                <td className="p-4 text-center text-text font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-text">ATS Structure Audits</td>
                <td className="p-4 text-center text-emerald-500 font-bold">✓</td>
                <td className="p-4 text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-text">Skill Tag Extractions</td>
                <td className="p-4 text-center text-emerald-500 font-bold">✓</td>
                <td className="p-4 text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-text">Missing Skill Finder</td>
                <td className="p-4 text-center text-danger font-bold">✗</td>
                <td className="p-4 text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-text">AI Bullet Sentence Rewrites</td>
                <td className="p-4 text-center text-danger font-bold">✗</td>
                <td className="p-4 text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-text">Job Description Match Check</td>
                <td className="p-4 text-center text-danger font-bold">✗</td>
                <td className="p-4 text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="p-4 font-medium text-text">Downloadable PDF reports</td>
                <td className="p-4 text-center text-danger font-bold">✗</td>
                <td className="p-4 text-center text-emerald-500 font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>



    </div>
  );
};

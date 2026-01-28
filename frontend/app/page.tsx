import { Button } from '@/components/ui/button'
import { ArrowRight, Lock, Users, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <span className="text-sm font-medium">Powered by Bitcoin</span>
              <Zap className="w-4 h-4" />
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
              Save together.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Grow together.
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A trustless community savings platform where you control your money, not a middleman. Save with your community, receive payouts in a transparent rotation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/app/create">
                <Button size="lg" className="gap-2 px-8 h-12">
                  Create a Kolo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/app/join">
                <Button size="lg" variant="outline" className="gap-2 px-8 h-12 bg-transparent">
                  Join a Kolo
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Card Visual */}
          <div className="relative h-96 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <p className="text-lg font-semibold text-foreground">Community-Powered Savings</p>
                <p className="text-muted-foreground mt-2">Smart contracts ensure trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">How KoloX Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start saving with your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Users,
                number: '1',
                title: 'Create or Join',
                description: 'Start a new Kolo or join an existing one with friends, family, or colleagues'
              },
              {
                icon: TrendingUp,
                number: '2',
                title: 'Contribute Together',
                description: 'Make fixed contributions every week or month. Smart contracts track everything'
              },
              {
                icon: Lock,
                number: '3',
                title: 'Receive Payouts',
                description: 'Get paid in rotation. Your turn is guaranteed by code, not promises'
              }
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-background border border-border rounded-2xl p-8 transition-all group-hover:border-primary/50">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-3xl font-bold text-primary/30">{step.number}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why KoloX */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Why KoloX</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Traditional savings groups have trust problems. KoloX solves them with code
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                title: 'No Middlemen',
                description: 'Your funds stay in a smart contract. No admin can steal or disappear with your money.'
              },
              {
                title: 'Transparent Rules',
                description: 'Every rule is locked in code before the Kolo starts. No surprises, no changes.'
              },
              {
                title: 'Bitcoin-Backed Security',
                description: 'Built on Stacks, which anchors to Bitcoin. Your savings are as secure as Bitcoin itself.'
              },
              {
                title: 'Fair Rotation',
                description: 'Payout order is deterministic. You know exactly when you\'ll receive your funds.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-background border border-border rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-accent/10 border-t border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Ready to start saving together?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of people building financial freedom through community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/app/dashboard">
              <Button size="lg" className="gap-2 px-8 h-12">
                Go to App
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

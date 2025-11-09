// app/info/about/page.tsx

import { Sparkles, Leaf, Award, Users, Heart, Droplet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * About Us Page: Professional brand story with values, mission, and team
 */
export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden border-b">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000')",
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70" />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg4djhIMzZ6bTAgMTZoOHY4SDM2em0wIDE2aDh2OEgzNnptMCAxNmg4djhIMzZ6bTAgMTZoOHY4SDM2em0wIDE2aDh2OEgzNnptMCAxNmg4djhIMzZ6bTAgMTZoOHY4SDM2em0wIDE2aDh2OEgzNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        </div>

        {/* Content */}
        <div className="container py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="mb-4 bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20">
              Established 2023
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
              Our Scented Story
            </h1>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed drop-shadow-lg max-w-3xl mx-auto">
              Where passion for perfumery meets commitment to sustainability
            </p>
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="container py-16 md:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Opening Story */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-foreground/90 leading-relaxed">
              Founded in 2023, <strong>Scentia</strong> was born from a passion for the art of perfumery 
              and a commitment to sustainability. We believe that luxury should not compromise the planet. 
              Our fragrances are crafted by master perfumers using ethically sourced, high-grade natural 
              oils and materials.
            </p>
            <p className="text-lg text-foreground/90 leading-relaxed">
              We specialize in complex, long-lasting <strong>Eau de Parfums</strong> and modern colognes. 
              Each bottle is a testament to our dedication to quality, designed to evoke emotion and 
              elevate your daily ritual.
            </p>
          </div>

          <Separator className="my-12" />

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Our Mission</h3>
                <p className="text-foreground/80 leading-relaxed">
                  To create exceptional fragrances that inspire confidence, evoke memories, and 
                  celebrate individuality—while respecting our planet and the people who make our 
                  products possible.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Our Vision</h3>
                <p className="text-foreground/80 leading-relaxed">
                  To become a global leader in sustainable luxury fragrances, where every scent tells 
                  a story and every purchase contributes to a better, more ethical world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Our Core Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Value 1 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
                    <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold">Sustainability</h3>
                  <p className="text-sm text-muted-foreground">
                    Ethically sourced ingredients, eco-friendly packaging, and carbon-neutral shipping 
                    for a better tomorrow.
                  </p>
                </CardContent>
              </Card>

              {/* Value 2 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold">Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    Master perfumers, premium ingredients, and rigorous quality control ensure every 
                    bottle meets our high standards.
                  </p>
                </CardContent>
              </Card>

              {/* Value 3 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mx-auto">
                    <Droplet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold">Authenticity</h3>
                  <p className="text-sm text-muted-foreground">
                    No synthetic shortcuts. We use real, natural ingredients to create genuine, 
                    long-lasting fragrances.
                  </p>
                </CardContent>
              </Card>

              {/* Value 4 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    We support local artisans, fair trade practices, and give back to the communities 
                    where our ingredients are sourced.
                  </p>
                </CardContent>
              </Card>

              {/* Value 5 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold">Passion</h3>
                  <p className="text-sm text-muted-foreground">
                    Every fragrance is a labor of love, crafted with dedication to bring joy and 
                    confidence to your everyday moments.
                  </p>
                </CardContent>
              </Card>

              {/* Value 6 */}
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    Blending traditional perfumery techniques with modern science to create unique, 
                    memorable scents.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-primary">100+</div>
                  <p className="text-sm text-muted-foreground font-medium">Unique Fragrances</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-primary">50K+</div>
                  <p className="text-sm text-muted-foreground font-medium">Happy Customers</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-primary">15+</div>
                  <p className="text-sm text-muted-foreground font-medium">Master Perfumers</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold text-primary">100%</div>
                  <p className="text-sm text-muted-foreground font-medium">Ethical Sourcing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20 border-t">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Thank You for Choosing Scentia
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every bottle you purchase supports sustainable practices, ethical sourcing, and artisan 
              communities around the world. Together, we're creating a more beautiful, fragrant future.
            </p>
            <div className="pt-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                Experience the world through scent
              </Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
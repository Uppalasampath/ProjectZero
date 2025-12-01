import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ArrowRight, Search, Leaf, TrendingUp, Globe, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const blogPosts = [
  {
    id: "csrd-compliance-2024",
    category: "Regulation",
    title: "CSRD Compliance: What Companies Need to Know in 2024",
    excerpt: "The EU's Corporate Sustainability Reporting Directive is reshaping how companies report on environmental impact. Here's your complete guide to compliance.",
    content: "The Corporate Sustainability Reporting Directive (CSRD) represents the most significant overhaul of sustainability reporting requirements in the European Union's history...",
    date: "Nov 28, 2024",
    readTime: "8 min read",
    featured: true,
    icon: FileText
  },
  {
    id: "voluntary-carbon-markets",
    category: "Carbon Markets",
    title: "The Rise of Voluntary Carbon Markets",
    excerpt: "Understanding the growth and evolution of voluntary carbon offset markets and their role in corporate net-zero strategies.",
    date: "Nov 25, 2024",
    readTime: "6 min read",
    featured: true,
    icon: TrendingUp
  },
  {
    id: "industrial-symbiosis",
    category: "Circular Economy",
    title: "Industrial Symbiosis: Turning Waste into Value",
    excerpt: "How leading manufacturers are creating new revenue streams through material exchange networks.",
    date: "Nov 20, 2024",
    readTime: "5 min read",
    featured: true,
    icon: Globe
  },
  {
    id: "scope-3-emissions",
    category: "Carbon Accounting",
    title: "Tackling Scope 3: A Practical Guide for Supply Chain Emissions",
    excerpt: "Scope 3 emissions often represent 70-90% of a company's carbon footprint. Learn how to measure and reduce them effectively.",
    date: "Nov 15, 2024",
    readTime: "10 min read",
    icon: Leaf
  },
  {
    id: "sbti-targets",
    category: "Net Zero",
    title: "Setting Science-Based Targets: Best Practices from Leading Companies",
    excerpt: "A deep dive into how Fortune 500 companies are setting and achieving their science-based emissions reduction targets.",
    date: "Nov 10, 2024",
    readTime: "7 min read",
    icon: TrendingUp
  },
  {
    id: "eu-green-deal",
    category: "Policy",
    title: "EU Green Deal: Implications for Corporate Sustainability",
    excerpt: "The European Green Deal is driving regulatory change across industries. Here's what it means for your business.",
    date: "Nov 5, 2024",
    readTime: "9 min read",
    icon: Globe
  },
  {
    id: "circular-business-models",
    category: "Circular Economy",
    title: "Circular Business Models: From Theory to Practice",
    excerpt: "Case studies of companies successfully implementing circular economy principles and the financial returns they're seeing.",
    date: "Oct 30, 2024",
    readTime: "6 min read",
    icon: Globe
  },
  {
    id: "carbon-capture",
    category: "Technology",
    title: "Carbon Capture and Storage: The State of the Technology",
    excerpt: "An overview of current carbon capture technologies, their costs, and their potential role in achieving net-zero.",
    date: "Oct 25, 2024",
    readTime: "8 min read",
    icon: Leaf
  },
  {
    id: "greenwashing-risks",
    category: "Compliance",
    title: "Avoiding Greenwashing: A Guide to Authentic Sustainability Claims",
    excerpt: "With increased regulatory scrutiny, companies must ensure their sustainability claims are accurate and verifiable.",
    date: "Oct 20, 2024",
    readTime: "5 min read",
    icon: FileText
  }
];

const categories = ["All", "Regulation", "Carbon Markets", "Circular Economy", "Carbon Accounting", "Net Zero", "Policy", "Technology", "Compliance"];

const Blog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const logoPath = isGitHubPages ? '/ProjectZero/zero-logo.png' : '/zero-logo.png';

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured || selectedCategory !== "All" || searchQuery);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={logoPath} alt="ZERO" className="h-8 w-auto" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Insights</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              onClick={() => navigate("/login")}
            >
              Join Beta
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-neutral-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-light text-neutral-900 mb-6">
              Sustainability Insights
            </h1>
            <p className="text-xl text-neutral-500 mb-8">
              Research, analysis, and practical guidance on carbon management, circular economy, and sustainability compliance.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-neutral-300 focus:border-neutral-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-neutral-100 sticky top-[73px] bg-white z-40">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex gap-2 py-4 overflow-x-auto no-scrollbar">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {selectedCategory === "All" && !searchQuery && (
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-6 max-w-7xl">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-8">Featured</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Featured */}
              <article className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-400 transition-colors cursor-pointer group">
                <div className="h-64 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-neutral-300/50 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-neutral-500" />
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{featuredPosts[0].category}</span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-xs text-neutral-400">{featuredPosts[0].readTime}</span>
                  </div>
                  <h3 className="text-2xl font-medium text-neutral-900 mb-3 group-hover:text-neutral-700 transition-colors">
                    {featuredPosts[0].title}
                  </h3>
                  <p className="text-neutral-600 mb-6">{featuredPosts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-400">{featuredPosts[0].date}</p>
                    <Button variant="ghost" className="text-neutral-900 hover:bg-neutral-100 p-0">
                      Read more <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>

              {/* Secondary Featured */}
              <div className="space-y-6">
                {featuredPosts.slice(1, 3).map((post) => {
                  const Icon = post.icon;
                  return (
                    <article 
                      key={post.id}
                      className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-neutral-400 transition-colors cursor-pointer group flex gap-6"
                    >
                      <div className="h-24 w-24 flex-shrink-0 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center">
                        <Icon className="h-8 w-8 text-neutral-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{post.category}</span>
                          <span className="text-neutral-300">•</span>
                          <span className="text-xs text-neutral-400">{post.readTime}</span>
                        </div>
                        <h3 className="font-medium text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-neutral-500">{post.date}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-8">
            {selectedCategory === "All" && !searchQuery ? "All Articles" : `${filteredPosts.length} Results`}
          </h2>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === "All" && !searchQuery ? regularPosts : filteredPosts).map((post) => {
                const Icon = post.icon;
                return (
                  <article 
                    key={post.id}
                    className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-neutral-400 transition-colors cursor-pointer group"
                  >
                    <div className="h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-neutral-300/50 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-neutral-500" />
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{post.category}</span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-xs text-neutral-400">{post.readTime}</span>
                      </div>
                      <h3 className="font-medium text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-4">{post.excerpt}</p>
                      <p className="text-xs text-neutral-400">{post.date}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-500 mb-4">No articles found matching your criteria.</p>
              <Button 
                variant="outline"
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-neutral-900">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
            Stay informed
          </h2>
          <p className="text-xl text-neutral-400 mb-8 font-light">
            Get the latest sustainability insights delivered to your inbox
          </p>
          
          <form className="max-w-md mx-auto flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-neutral-500 focus:border-white"
            />
            <Button className="h-12 px-6 bg-white hover:bg-neutral-100 text-neutral-900">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-12 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={logoPath} alt="ZERO" className="h-6 w-auto" />
            </div>
            <p className="text-sm text-neutral-500">© 2024 ZERO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;

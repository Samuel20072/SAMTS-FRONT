import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BlogPostsService } from '../../services/api/blog-posts.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './blog.page.html',
  styles: [`
    .blog-card {
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .blog-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 40px -12px rgba(37, 99, 235, 0.18);
    }
  `]
})
export class BlogPage implements OnInit {
  private blogPostsService = inject(BlogPostsService);
  private router = inject(Router);

  posts = signal<BlogPost[]>([]);
  filteredPosts = signal<BlogPost[]>([]);
  searchQuery = signal('');
  isLoading = signal(true);

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading.set(true);
    this.blogPostsService.getPublicAll().subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        this.posts.set(data);
        this.filteredPosts.set(data);
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); }
    });
  }

  onSearchChange() {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) { this.filteredPosts.set(this.posts()); return; }
    this.filteredPosts.set(
      this.posts().filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query)
      )
    );
  }

  viewDetail(slug: string) {
    this.router.navigate(['/blog', slug]);
  }

  getImageUrl(slug: string): string {
    // Deterministic image per article using slug as seed
    const seed = encodeURIComponent(slug);
    return `https://picsum.photos/seed/${seed}/800/450`;
  }

  getExcerpt(content: string): string {
    if (!content) return '';
    return content
      .replace(/[#*`_~>\-]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 160);
  }
}

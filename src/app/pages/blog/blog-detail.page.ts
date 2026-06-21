import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './blog-detail.page.html',
  styles: [`
    .prose-content p {
      margin-bottom: 1.5rem;
      line-height: 1.85;
    }
  `]
})
export class BlogDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogPostsService = inject(BlogPostsService);

  post = signal<BlogPost | null>(null);
  paragraphs = signal<string[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) this.loadPost(slug);
      else this.router.navigate(['/blog']);
    });
  }

  loadPost(slug: string) {
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.blogPostsService.getPublicBySlug(slug).subscribe({
      next: (res: any) => {
        if (res) {
          this.post.set(res);
          const paras = (res.content || '')
            .split(/\n\s*\n/)
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0);
          this.paragraphs.set(paras);
        } else {
          this.errorMsg.set('El artículo no fue encontrado.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Ocurrió un error al cargar el artículo.');
        this.isLoading.set(false);
      }
    });
  }

  getHeroImage(slug: string): string {
    return `https://picsum.photos/seed/${encodeURIComponent(slug)}/1200/600`;
  }

  getInlineImage(slug: string, index: number): string {
    return `https://picsum.photos/seed/${encodeURIComponent(slug + index)}/800/450`;
  }

  goBack() {
    this.router.navigate(['/blog']);
  }

  // Inject inline image after every 3rd paragraph
  shouldShowImage(index: number): boolean {
    return (index + 1) % 3 === 0 && index < this.paragraphs().length - 1;
  }
}

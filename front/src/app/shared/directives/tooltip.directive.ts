import { Directive, ElementRef, HostListener, Input, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay: number = 200;

  private tooltipElement: HTMLElement | null = null;
  private timeoutId: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipText) return;

    this.timeoutId = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.hideTooltip();
  }

  private showTooltip(): void {
    this.tooltipElement = this.renderer.createElement('div');
    const text = this.renderer.createText(this.tooltipText);
    
    this.renderer.appendChild(this.tooltipElement, text);
    this.renderer.appendChild(document.body, this.tooltipElement);
    
    // Styling
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background', 'rgba(0, 0, 0, 0.8)');
    this.renderer.setStyle(this.tooltipElement, 'color', 'white');
    this.renderer.setStyle(this.tooltipElement, 'padding', '6px 12px');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipElement, 'font-size', '13px');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '10000');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.tooltipElement, 'transition', 'opacity 0.2s');
    
    // Positioning
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    
    // Force layout recalculation to get actual tooltip dimensions
    setTimeout(() => {
      if (!this.tooltipElement) return;
      
      const tooltipPos = this.tooltipElement.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      
      switch (this.tooltipPosition) {
        case 'top':
          top = hostPos.top - tooltipPos.height - 8;
          left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
          break;
        case 'bottom':
          top = hostPos.bottom + 8;
          left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
          break;
        case 'left':
          top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
          left = hostPos.left - tooltipPos.width - 8;
          break;
        case 'right':
          top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
          left = hostPos.right + 8;
          break;
      }
      
      this.renderer.setStyle(this.tooltipElement, 'top', `${top + window.scrollY}px`);
      this.renderer.setStyle(this.tooltipElement, 'left', `${left + window.scrollX}px`);
    }, 0);
  }

  private hideTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.hideTooltip();
  }
}

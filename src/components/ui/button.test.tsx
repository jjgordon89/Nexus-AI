import { render, screen, fireEvent } from '../../test/test-utils';
import { Button } from './button';

describe('Button component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    
    // Check for the destructive variant class
    expect(button).toHaveClass('bg-destructive');
    expect(button).toHaveClass('text-destructive-foreground');
  });

  it('applies size styles correctly', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByText('Small Button');
    
    // Check for the small size class
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('text-xs');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByText('Custom Button');
    
    // Check for the custom class
    expect(button).toHaveClass('custom-class');
  });

  it('works as a child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="#test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByText('Link Button');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#test');
  });
});
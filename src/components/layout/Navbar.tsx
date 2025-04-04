
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center">
        <div className="mr-8 font-bold text-xl">NUVO ICM Manager</div>
        <div className="flex items-center space-x-4">
          <Link to="/schemes">
            <Button variant="ghost">Schemes</Button>
          </Link>
          <Link to="/schemes/new">
            <Button variant="ghost">Create Scheme</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

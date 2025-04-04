
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import styles from '@/styles/index.module.css';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to NUVO ICM Manager</h1>
        <p className={styles.subtitle}>
          Incentive Compensation Management Made Simple
        </p>
        
        <div className={styles.buttonGroup}>
          <Button 
            className={styles.primaryButton}
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
          <Button 
            className={styles.outlineButton}
            variant="outline"
            onClick={() => navigate('/schemes')}
          >
            View Schemes
          </Button>
        </div>
        
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Create Schemes</h3>
            <p className={styles.featureDescription}>
              Design and manage incentive schemes with flexible rules
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Run Simulations</h3>
            <p className={styles.featureDescription}>
              Test your schemes before deployment to production
            </p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Track Performance</h3>
            <p className={styles.featureDescription}>
              Monitor agent performance and incentive payouts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


import React from 'react';
import { AgentResult } from '@/api/agent';
import styles from '@/styles/modernUI.module.css';

interface AgentResultDetailsProps {
  result: AgentResult;
  schemeName: string;
}

export function AgentResultDetails({ result, schemeName }: AgentResultDetailsProps) {
  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <h3 className={styles.detailTitle}>{schemeName} Details</h3>
      </div>
      <div className={styles.detailContent}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Qualification Status</th>
              <th>Commission</th>
              <th>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{result.qualified ? 'Qualified' : 'Not Qualified'}</td>
              <td>${result.commission.toFixed(2)}</td>
              <td>{result.totalSales ? `$${result.totalSales.toFixed(2)}` : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

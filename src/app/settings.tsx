import { Card } from '@/components/card';
import { Screen } from '@/components/screen';

export default function SettingsScreen() {
  return (
    <Screen title="Settings">
      <Card title="Weather" body="Temperature units, home location, and whether you run cold or warm." />
      <Card title="Morning outfit" body="When to get your daily outfit notification." />
      <Card title="Privacy" body="Photos stay on your phone. Backup and data export will live here." />
    </Screen>
  );
}

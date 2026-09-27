import { router } from 'expo-router';

import { Card, PrimaryButton } from '@/components/card';
import { Screen } from '@/components/screen';

export default function TodayScreen() {
  return (
    <Screen title="Today" subtitle="Your outfit for the day will appear here.">
      <Card
        title="Start with your wardrobe"
        body="Scan a few pieces of clothing and their labels. Once there's enough to combine, a daily outfit shows up here based on the weather and your plans.">
        <PrimaryButton label="Scan an item" onPress={() => router.navigate('/scan')} />
      </Card>
      <Card
        title="Coming next"
        body="Weather for the whole day, Shuffle, Swap one piece, and Lock a piece."
      />
    </Screen>
  );
}

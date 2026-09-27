import { router } from 'expo-router';

import { Card, PrimaryButton } from '@/components/card';
import { Screen } from '@/components/screen';

export default function CatalogScreen() {
  return (
    <Screen title="Catalog" subtitle="Everything you've scanned, in one place.">
      <Card
        title="No items yet"
        body="Items you scan appear here with filters for category, color, season, and whether they're clean.">
        <PrimaryButton label="Scan an item" onPress={() => router.navigate('/scan')} />
      </Card>
    </Screen>
  );
}

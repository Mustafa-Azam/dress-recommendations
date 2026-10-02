import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, PrimaryButton } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { categoryLabel } from '@/constants/wardrobe-options';
import { useTheme } from '@/hooks/use-theme';
import { listClothingItems } from '@/lib/wardrobe-store';
import type { ClothingItem } from '@/types/wardrobe';

export default function CatalogScreen() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<ClothingItem[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      listClothingItems(db).then((loaded) => {
        if (active) {
          setItems(loaded);
        }
      });
      return () => {
        active = false;
      };
    }, [db])
  );

  if (items === null) {
    return <Screen title="Catalog">{null}</Screen>;
  }

  if (items.length === 0) {
    return (
      <Screen title="Catalog" subtitle="Everything you've scanned, in one place.">
        <Card
          title="No items yet"
          body="Items you scan appear here. Filters for category, color, season, and laundry come next.">
          <PrimaryButton label="Scan an item" onPress={() => router.navigate('/scan')} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Catalog" subtitle={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}>
      <View style={styles.grid}>
        {items.map((item) => (
          <ItemTile key={item.id} item={item} />
        ))}
      </View>
    </Screen>
  );
}

function ItemTile({ item }: { item: ClothingItem }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.tile}>
      <Image source={{ uri: item.photoUri }} style={styles.tilePhoto} contentFit="cover" />
      <View style={styles.tileText}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {item.subcategory ?? categoryLabel(item.category)}
        </ThemedText>
        <View style={styles.swatches}>
          {item.colors.map((color) => (
            <View
              key={color.hex}
              accessibilityLabel={color.name}
              style={[styles.swatch, { backgroundColor: color.hex, borderColor: theme.backgroundSelected }]}
            />
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    maxWidth: 240,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  tilePhoto: {
    width: '100%',
    aspectRatio: 1,
  },
  tileText: {
    padding: Spacing.two + Spacing.one,
    gap: Spacing.one,
  },
  swatches: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
});

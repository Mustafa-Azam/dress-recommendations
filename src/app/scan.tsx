import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Card, PrimaryButton, SecondaryButton } from '@/components/card';
import { Field, MultiSelect, SingleSelect, TextField } from '@/components/form';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  CATEGORY_OPTIONS,
  FORMALITY_OPTIONS,
  OCCASION_OPTIONS,
  SEASON_OPTIONS,
} from '@/constants/wardrobe-options';
import { useTheme } from '@/hooks/use-theme';
import { detectColors } from '@/lib/analyze-photo';
import type { DominantColor } from '@/lib/color';
import { formatFiberContent, parseFiberContent } from '@/lib/fibers';
import { pickPhoto, type PhotoSource } from '@/lib/pick-photo';
import { deletePhoto, savePhoto } from '@/lib/photo-storage';
import { insertClothingItem } from '@/lib/wardrobe-store';
import type { Category, ClothingItem, Occasion, Season } from '@/types/wardrobe';

type Draft = {
  photoUri: string;
  labelPhotoUri?: string;
  colors: (DominantColor & { included: boolean })[];
  category?: Category;
  subcategory: string;
  brand: string;
  size: string;
  fabric: string;
  formality: ClothingItem['formality'];
  seasons: Season[];
  occasions: Occasion[];
};

function newDraft(photoUri: string, colors: DominantColor[]): Draft {
  return {
    photoUri,
    colors: colors.map((c) => ({ ...c, included: true })),
    subcategory: '',
    brand: '',
    size: '',
    fabric: '',
    formality: 2,
    seasons: [],
    occasions: [],
  };
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ScanScreen() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function startScan(source: PhotoSource) {
    const uri = await pickPhoto(source);
    if (!uri) {
      return;
    }
    setAnalyzing(true);
    let colors: DominantColor[] = [];
    try {
      colors = await detectColors(uri);
    } catch (error) {
      console.warn('Color detection failed', error);
    }
    setDraft(newDraft(uri, colors));
    setAnalyzing(false);
  }

  if (analyzing) {
    return (
      <Screen title="Scan" subtitle="Finding the colors in your photo…">
        <ActivityIndicator size="large" />
      </Screen>
    );
  }

  if (draft) {
    return <DetailsForm draft={draft} onChange={setDraft} onDone={() => setDraft(null)} />;
  }

  return (
    <Screen title="Scan" subtitle="Add a piece of clothing to your catalog.">
      <Card
        title="Photograph the item"
        body="Lay it flat or hang it against a plain wall, with the whole item in the frame. Its main colors are picked out automatically.">
        <View style={styles.buttonRow}>
          <PrimaryButton label="Take photo" onPress={() => startScan('camera')} />
          <SecondaryButton label="Choose from library" onPress={() => startScan('library')} />
        </View>
      </Card>
      <Card
        title="Then add the label"
        body="On the next screen you can photograph the care label and fill in the fabric, size, and brand. Reading labels automatically comes in a later update."
      />
    </Screen>
  );
}

type DetailsFormProps = {
  draft: Draft;
  onChange: (draft: Draft) => void;
  onDone: () => void;
};

function DetailsForm({ draft, onChange, onDone }: DetailsFormProps) {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const update = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  const fibers = parseFiberContent(draft.fabric);

  async function addLabelPhoto(source: PhotoSource) {
    const uri = await pickPhoto(source);
    if (uri) {
      update({ labelPhotoUri: uri });
    }
  }

  async function save() {
    if (!draft.category) {
      Alert.alert('Choose a category', 'Pick what kind of item this is before saving.');
      return;
    }
    setSaving(true);
    const id = newId();
    const saved: string[] = [];
    try {
      const photoPath = await savePhoto(draft.photoUri, `${id}-photo`);
      saved.push(photoPath);
      const labelPath = draft.labelPhotoUri
        ? await savePhoto(draft.labelPhotoUri, `${id}-label`)
        : undefined;
      if (labelPath) {
        saved.push(labelPath);
      }

      const item: ClothingItem = {
        id,
        createdAt: new Date().toISOString(),
        photoUri: photoPath,
        labelPhotoUri: labelPath,
        category: draft.category,
        subcategory: draft.subcategory.trim() || undefined,
        brand: draft.brand.trim() || undefined,
        size: draft.size.trim() || undefined,
        colors: draft.colors.filter((c) => c.included).map(({ hex, name }) => ({ hex, name })),
        formality: draft.formality,
        fibers,
        seasons: draft.seasons,
        occasions: draft.occasions,
        favorite: false,
        wearCount: 0,
        laundry: 'clean',
      };
      await insertClothingItem(db, item);
      onDone();
      router.navigate('/catalog');
    } catch (error) {
      saved.forEach(deletePhoto);
      console.warn('Saving item failed', error);
      Alert.alert('Could not save', 'Something went wrong saving this item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen title="Item details" subtitle="Check what was detected and fill in the rest.">
      <Image source={{ uri: draft.photoUri }} style={styles.photo} contentFit="contain" />

      <Field label="Colors (tap to remove)">
        {draft.colors.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            No colors detected. Try a photo against a plain background.
          </ThemedText>
        ) : (
          <View style={styles.colorRow}>
            {draft.colors.map((color, index) => (
              <Pressable
                key={color.hex}
                accessibilityRole="button"
                accessibilityState={{ selected: color.included }}
                onPress={() =>
                  update({
                    colors: draft.colors.map((c, i) =>
                      i === index ? { ...c, included: !c.included } : c
                    ),
                  })
                }
                style={[
                  styles.colorChip,
                  { backgroundColor: theme.backgroundElement, opacity: color.included ? 1 : 0.4 },
                ]}>
                <View style={[styles.swatch, { backgroundColor: color.hex, borderColor: theme.backgroundSelected }]} />
                <ThemedText type="small">
                  {color.name} · {Math.round(color.share * 100)}%
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </Field>

      <Field label="Category">
        <SingleSelect
          options={CATEGORY_OPTIONS}
          value={draft.category}
          onChange={(category) => update({ category })}
        />
      </Field>

      <Field label="What is it?">
        <TextField
          placeholder="e.g. Oxford shirt, chinos, trench coat"
          value={draft.subcategory}
          onChangeText={(subcategory) => update({ subcategory })}
        />
      </Field>

      <Field label="Care label">
        {draft.labelPhotoUri ? (
          <Image source={{ uri: draft.labelPhotoUri }} style={styles.labelPhoto} contentFit="cover" />
        ) : null}
        <View style={styles.buttonRow}>
          <SecondaryButton
            label={draft.labelPhotoUri ? 'Retake label photo' : 'Photograph label'}
            onPress={() => addLabelPhoto('camera')}
          />
          <SecondaryButton label="From library" onPress={() => addLabelPhoto('library')} />
        </View>
      </Field>

      <Field label="Fabric">
        <TextField
          placeholder="e.g. 60% cotton, 40% polyester"
          value={draft.fabric}
          onChangeText={(fabric) => update({ fabric })}
          autoCapitalize="none"
        />
        {fibers.length > 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Read as: {formatFiberContent(fibers)}
          </ThemedText>
        ) : null}
      </Field>

      <View style={styles.twoColumns}>
        <View style={styles.column}>
          <Field label="Brand">
            <TextField value={draft.brand} onChangeText={(brand) => update({ brand })} />
          </Field>
        </View>
        <View style={styles.column}>
          <Field label="Size">
            <TextField
              value={draft.size}
              onChangeText={(size) => update({ size })}
              autoCapitalize="characters"
            />
          </Field>
        </View>
      </View>

      <Field label="How dressy is it?">
        <SingleSelect
          options={FORMALITY_OPTIONS}
          value={draft.formality}
          onChange={(formality) => update({ formality })}
        />
      </Field>

      <Field label="Seasons">
        <MultiSelect options={SEASON_OPTIONS} values={draft.seasons} onChange={(seasons) => update({ seasons })} />
      </Field>

      <Field label="Occasions">
        <MultiSelect
          options={OCCASION_OPTIONS}
          values={draft.occasions}
          onChange={(occasions) => update({ occasions })}
        />
      </Field>

      <View style={styles.buttonRow}>
        <PrimaryButton label={saving ? 'Saving…' : 'Save to catalog'} onPress={save} disabled={saving} />
        <SecondaryButton label="Discard" onPress={onDone} disabled={saving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.three,
  },
  labelPhoto: {
    width: 120,
    height: 120,
    borderRadius: Spacing.two,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  colorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one + Spacing.half,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  column: {
    flex: 1,
  },
});

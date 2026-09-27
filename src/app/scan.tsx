import { Card } from '@/components/card';
import { Screen } from '@/components/screen';

const STEPS = [
  {
    title: '1. Photograph the item',
    body: 'Lay it flat or hang it against a plain wall. The background is removed automatically and the main colors are picked out.',
  },
  {
    title: '2. Photograph the label',
    body: 'The brand, size, fabric mix, and care symbols are read from the tag. Faded or missing labels are fine.',
  },
  {
    title: '3. Check the details',
    body: 'Review what was filled in, correct anything wrong, and add what the label left out.',
  },
];

export default function ScanScreen() {
  return (
    <Screen title="Scan" subtitle="Add clothing in three quick steps. The camera comes in the next update.">
      {STEPS.map((step) => (
        <Card key={step.title} title={step.title} body={step.body} />
      ))}
    </Screen>
  );
}

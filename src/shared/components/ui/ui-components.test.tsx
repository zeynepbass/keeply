import { fireEvent, render, screen } from '@testing-library/react-native';
import { Package } from 'lucide-react-native';

import { t } from '@/shared/i18n';

import { Badge } from './badge';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Chip } from './chip';
import { EmptyState } from './empty-state';
import { SegmentedControl } from './segmented-control';
import { TextField } from './text-field';

describe('UI components', () => {
  it('fires button presses and blocks them while disabled', async () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    await render(
      <>
        <Button label={t.common.save} onPress={onSave} />
        <Button label={t.common.delete} onPress={onDelete} disabled />
      </>,
    );
    await fireEvent.press(screen.getByRole('button', { name: t.common.save }));
    await fireEvent.press(screen.getByRole('button', { name: t.common.delete }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('shows Turkish validation errors under text fields', async () => {
    await render(<TextField label={t.auth.email} value="eksik@" error={t.validation.emailInvalid} onChangeText={jest.fn()} />);
    expect(screen.getByText(t.validation.emailInvalid)).toBeTruthy();
    expect(screen.getByText(t.auth.email)).toBeTruthy();
  });

  it('exposes chip, checkbox and segment selection state', async () => {
    const onChange = jest.fn();
    await render(
      <>
        <Chip label={t.categories.electronics} selected />
        <Checkbox checked={false} onChange={onChange} accessibilityLabel={t.auth.terms} />
        <SegmentedControl
          value="light"
          onChange={onChange}
          options={[
            { value: 'light', label: t.profile.themes.light },
            { value: 'dark', label: t.profile.themes.dark },
          ]}
        />
      </>,
    );
    expect(screen.getByRole('button', { name: t.categories.electronics }).props.accessibilityState.selected).toBe(true);
    await fireEvent.press(screen.getByRole('checkbox', { name: t.auth.terms }));
    expect(onChange).toHaveBeenCalledWith(true);
    await fireEvent.press(screen.getByRole('tab', { name: t.profile.themes.dark }));
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('renders empty states with a call to action', async () => {
    const onAction = jest.fn();
    await render(
      <EmptyState icon={Package} title={t.products.emptyTitle} description={t.products.emptyDescription} actionLabel={t.products.emptyAction} onAction={onAction} />,
    );
    expect(screen.getByText(t.products.emptyTitle)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: t.products.emptyAction }));
    expect(onAction).toHaveBeenCalled();
  });

  it('renders badges with labels', async () => {
    await render(<Badge label={t.warrantyStatus.activeLong} tone="success" />);
    expect(screen.getByText(t.warrantyStatus.activeLong)).toBeTruthy();
  });
});

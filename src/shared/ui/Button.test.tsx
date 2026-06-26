import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it("title matnini ko'rsatadi", async () => {
    const { getByText } = await render(
      <Button title="Boshlash" onPress={() => {}} />,
    );
    expect(getByText('Boshlash')).toBeTruthy();
  });

  it('bosilganda onPress chaqiriladi', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button title="Boshlash" onPress={onPress} />,
    );
    fireEvent.press(getByText('Boshlash'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("disabled bo'lsa onPress chaqirilmaydi", async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button title="Boshlash" onPress={onPress} disabled />,
    );
    fireEvent.press(getByText('Boshlash'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

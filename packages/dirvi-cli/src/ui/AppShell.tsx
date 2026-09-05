import { Text } from 'ink';
import { EventMessage } from '../domain/event-message.js';
import { App } from './App.js';
import { useEffect, useState } from 'react';
import { loadInitialPosixProps } from '../infrastructure/load-initial-posix-props.js';
import { PosixAppProps } from '../application/posix-app.js';

export type ShellAppProps = {
  print?: (message: EventMessage) => void;
  onError?: (error: Error) => void;
};

export function AppShell({ print, onError }: ShellAppProps) {
  const [props, setProps] = useState<PosixAppProps>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let mounted = true;

    loadInitialPosixProps()
      .then((props) => {
        if (mounted) {
          setProps(props);
        }
      })
      .catch((cause: unknown) => {
        const nextError =
          cause instanceof Error ? cause : new Error(String(cause));

        if (mounted) {
          setError(nextError);
          onError?.(nextError);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (props === undefined) {
    return <Text dimColor>Loading.</Text>;
  }

  if (props.initialState === null) {
    return <Text dimColor>Empty.</Text>;
  }

  return (
    <App
      cwdAddress={props.cwdAddress}
      initialState={props.initialState}
      print={print}
      onError={onError}
    />
  );
}

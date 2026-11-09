import React from 'react';
// import { ExampleChild } from './ExampleChild';
import { CreationAndExecutionView } from './CreationAndExecution';

export function ExampleComponent() {
  return (
    <section className="p-4 border rounded-md bg-gray-100">
      <h2 className="text-lg font-semibold mb-2">Example Component</h2>
      <CreationAndExecutionView />
    </section>
  );
}


import { TransformControls } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { type SceneResourceDecoratorProps } from "react-iiif-vault/scene-panel";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ArrowHelper,
  BoxHelper,
  Camera,
  CameraHelper,
  Color,
  Group,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
} from "three";
import {
  sceneTransformValueFromMatrix,
  type SceneTransformMode,
  type SceneTransformSpace,
  type SceneTransformValue,
} from "../../helpers/model-transforms";

export function SceneResourceEditor({
  annotation,
  resource,
  target,
  type,
  object,
  selected,
  select,
  refreshBounds,
  mode,
  space,
  snap,
  showCameraHelpers,
  showLightHelpers,
  onCommit,
  onCancel,
  onTransformChange,
}: SceneResourceDecoratorProps & {
  mode: SceneTransformMode;
  space: SceneTransformSpace;
  snap: boolean;
  showCameraHelpers: boolean;
  showLightHelpers: boolean;
  onCommit(value: SceneTransformValue): void;
  onCancel(annotationId: string): void;
  onTransformChange?(): void;
}) {
  const camera = type === "perspective-camera" || type === "orthographic-camera";
  const light = type.endsWith("light");
  return (
    <>
      {selected ? <SelectionOutline object={object} /> : null}
      {selected ? (
        <ObjectTransformControls
          annotationId={annotation.id}
          mode={mode}
          object={object}
          snap={snap}
          space={space}
          targetPoint={target.point}
          onCancel={onCancel}
          onCommit={onCommit}
          onChange={() => {
            refreshBounds();
            onTransformChange?.();
          }}
        />
      ) : null}
      {camera && showCameraHelpers && object instanceof Camera ? (
        <CameraEditorHelper camera={object} orthographic={type === "orthographic-camera"} select={select} />
      ) : null}
      {light && showLightHelpers ? <LightEditorHelper object={object} resource={resource} select={select} /> : null}
    </>
  );
}

function ObjectTransformControls({
  annotationId,
  mode,
  object,
  snap,
  space,
  targetPoint,
  onCancel,
  onChange,
  onCommit,
}: {
  annotationId: string;
  mode: SceneTransformMode;
  object: Object3D;
  snap: boolean;
  space: SceneTransformSpace;
  targetPoint: readonly [number, number, number] | null;
  onCancel(annotationId: string): void;
  onChange(): void;
  onCommit(value: SceneTransformValue): void;
}) {
  const scene = useThree((state) => state.scene);
  const controls = useThree((state) => state.controls) as { enabled?: boolean } | null;
  const transformControls = useRef<any>(null);
  const preDrag = useRef<Matrix4 | null>(null);
  const dragging = useRef(false);
  const controlsEnabled = useRef<boolean | undefined>(undefined);

  const value = useCallback(() => {
    object.updateMatrix();
    return sceneTransformValueFromMatrix(annotationId, object.matrix, targetPoint);
  }, [annotationId, object, targetPoint]);
  const finish = useCallback(() => {
    dragging.current = false;
    if (controls && controlsEnabled.current !== undefined) controls.enabled = controlsEnabled.current;
    controlsEnabled.current = undefined;
  }, [controls]);
  const cancel = useCallback(() => {
    if (!dragging.current || !preDrag.current) return;
    object.matrix.copy(preDrag.current);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
    if (transformControls.current) {
      transformControls.current.dragging = false;
      transformControls.current.axis = null;
      transformControls.current.dispatchEvent({ type: "dragging-changed", value: false });
    }
    onChange();
    finish();
    onCancel(annotationId);
  }, [annotationId, finish, object, onCancel, onChange]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cancel]);
  useEffect(() => finish, [finish]);

  return createPortal(
    <TransformControls
      ref={transformControls}
      object={object}
      mode={mode}
      space={space}
      translationSnap={snap ? 0.25 : null}
      rotationSnap={snap ? Math.PI / 12 : null}
      scaleSnap={snap ? 0.1 : null}
      onMouseDown={() => {
        object.updateMatrix();
        preDrag.current = object.matrix.clone();
        dragging.current = true;
        controlsEnabled.current = controls?.enabled;
        if (controls) controls.enabled = false;
      }}
      onObjectChange={onChange}
      onMouseUp={() => {
        if (!dragging.current) return;
        const transform = value();
        finish();
        onCommit(transform);
      }}
    />,
    scene
  );
}

function SelectionOutline({ object }: { object: Object3D }) {
  const scene = useThree((state) => state.scene);
  const helper = useMemo(() => {
    const value = new BoxHelper(object, 0x4da3ff);
    value.userData.rivSceneEditorHelper = true;
    value.raycast = () => undefined;
    return value;
  }, [object]);
  useFrame(() => helper.update());
  useEffect(() => () => helper.dispose(), [helper]);
  return createPortal(<primitive object={helper} />, scene);
}

function CameraEditorHelper({
  camera,
  orthographic,
  select,
}: {
  camera: Camera;
  orthographic: boolean;
  select(): void;
}) {
  const scene = useThree((state) => state.scene);
  const root = useRef<Group>(null);
  const pointerDown = useRef<SceneEditorPointerSample | null>(null);
  const helper = useMemo(() => {
    const value = new CameraHelper(camera);
    value.userData.rivSceneEditorHelper = true;
    value.raycast = () => undefined;
    return value;
  }, [camera]);
  useFrame(() => {
    if (root.current) syncObjectToWorldTransform(root.current, camera);
    helper.update();
  });
  useEffect(() => () => helper.dispose(), [helper]);
  return (
    <>
      <group
        ref={root}
        userData={{ rivSceneEditorHelper: true }}
        onPointerDown={(event) => {
          pointerDown.current = sceneEditorPointerSample(event);
        }}
        onPointerCancel={() => {
          pointerDown.current = null;
        }}
        onClick={(event) => {
          const start = pointerDown.current;
          pointerDown.current = null;
          if (!start || !isSceneEditorSelectionClick(start, sceneEditorPointerSample(event))) return;
          event.stopPropagation();
          select();
        }}
      >
        <mesh>
          <octahedronGeometry args={[0.12, 0]} />
          <meshBasicMaterial color="#4da3ff" depthTest={false} />
        </mesh>
        <mesh position={[0, 0, -0.24]} rotation={[Math.PI / 2, 0, 0]}>
          {orthographic ? <boxGeometry args={[0.24, 0.34, 0.24]} /> : <coneGeometry args={[0.2, 0.4, 4, 1, true]} />}
          <meshBasicMaterial color="#4da3ff" wireframe depthTest={false} />
        </mesh>
      </group>
      {createPortal(<primitive object={helper} />, scene)}
    </>
  );
}

function LightEditorHelper({
  object,
  resource,
  select,
}: {
  object: Object3D;
  resource: Record<string, unknown>;
  select(): void;
}) {
  const root = useRef<Group>(null);
  const pointerDown = useRef<SceneEditorPointerSample | null>(null);
  const type = String(resource.type || "Light");
  const color = String(resource.color || "#ffffff");
  const directional = type === "DirectionalLight" || type === "SpotLight";
  const arrow = useMemo(
    () =>
      directional
        ? new ArrowHelper(new Vector3(0, -1, 0), new Vector3(), 0.9, new Color(color).getHex(), 0.14, 0.08)
        : null,
    [color, directional]
  );
  useFrame(() => {
    if (!root.current) return;
    syncObjectToWorldTransform(root.current, object);
    if (!arrow) return;
    const origin = root.current.getWorldPosition(new Vector3());
    let lightTarget: Object3D | null = null;
    object.traverse((child) => {
      const target = (child as Object3D & { target?: Object3D }).target;
      if (!lightTarget && target instanceof Object3D) lightTarget = target;
    });
    const point = lightTarget
      ? (lightTarget as Object3D).getWorldPosition(new Vector3())
      : origin.clone().add(new Vector3(0, -1, 0));
    const direction = point
      .sub(origin)
      .applyQuaternion(root.current.getWorldQuaternion(new Quaternion()).invert())
      .normalize();
    if (direction.lengthSq()) arrow.setDirection(direction);
  });
  useEffect(() => () => arrow?.dispose(), [arrow]);
  return (
    <group
      ref={root}
      userData={{ rivSceneEditorHelper: true }}
      onPointerDown={(event) => {
        pointerDown.current = sceneEditorPointerSample(event);
      }}
      onPointerCancel={() => {
        pointerDown.current = null;
      }}
      onClick={(event) => {
        const start = pointerDown.current;
        pointerDown.current = null;
        if (!start || !isSceneEditorSelectionClick(start, sceneEditorPointerSample(event))) return;
        event.stopPropagation();
        select();
      }}
    >
      <mesh renderOrder={1000}>
        <sphereGeometry args={[0.085, 12, 12]} />
        <meshBasicMaterial color={color} depthTest={false} />
      </mesh>
      {arrow ? <primitive object={arrow} /> : null}
      {type === "SpotLight" ? (
        <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.24, 0.6, 16, 1, true]} />
          <meshBasicMaterial color={color} wireframe depthTest={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function syncObjectToWorldTransform(target: Object3D, source: Object3D) {
  source.updateWorldMatrix(true, false);
  const position = source.getWorldPosition(new Vector3());
  const quaternion = source.getWorldQuaternion(new Quaternion());
  if (target.parent) {
    target.parent.updateWorldMatrix(true, false);
    target.parent.worldToLocal(position);
    quaternion.premultiply(target.parent.getWorldQuaternion(new Quaternion()).invert());
  }
  target.position.copy(position);
  target.quaternion.copy(quaternion);
  target.updateMatrixWorld();
}

type SceneEditorPointerSample = { x: number; y: number; time: number };

function sceneEditorPointerSample(event: any): SceneEditorPointerSample {
  const source = event.nativeEvent || event;
  return {
    x: Number(source.clientX ?? source.offsetX ?? 0),
    y: Number(source.clientY ?? source.offsetY ?? 0),
    time: Number(source.timeStamp ?? 0),
  };
}

export function isSceneEditorSelectionClick(start: SceneEditorPointerSample, end: SceneEditorPointerSample) {
  const duration = end.time - start.time;
  return duration >= 0 && duration <= 500 && Math.hypot(end.x - start.x, end.y - start.y) <= 3;
}

import { useState, useRef, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';

const CANVAS_WIDTH = 1122; // A4 Landscape roughly
const CANVAS_HEIGHT = 793;

export const useFabricEditor = (initialDataJSON?: any) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObjects, setActiveObjects] = useState<fabric.Object[]>([]);
  const [objectsList, setObjectsList] = useState<fabric.Object[]>([]);

  // History State
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isHistoryProcessingRef = useRef(false);

  useEffect(() => {
    if (!canvasElementRef.current) return;
    const c = new fabric.Canvas(canvasElementRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });
    setCanvas(c);

    if (initialDataJSON) {
      c.loadFromJSON(initialDataJSON).then(() => {
        c.renderAll();
        saveHistory(c);
        updateObjectsList(c);
      });
    } else {
      saveHistory(c);
    }

    const handleSelection = (e: any) => {
      setActiveObjects(c.getActiveObjects());
    };

    c.on('selection:created', handleSelection);
    c.on('selection:updated', handleSelection);
    c.on('selection:cleared', handleSelection);

    c.on('object:modified', () => {
      saveHistory(c);
      updateObjectsList(c);
    });
    c.on('object:added', () => {
      if (!isHistoryProcessingRef.current) saveHistory(c);
      updateObjectsList(c);
    });
    c.on('object:removed', () => {
      if (!isHistoryProcessingRef.current) saveHistory(c);
      updateObjectsList(c);
    });

    return () => {
      c.dispose();
    };
  }, []);

  const updateObjectsList = (c: fabric.Canvas) => {
    // Return objects in reverse order so top layers are first in the list
    setObjectsList([...c.getObjects()].reverse());
    setActiveObjects(c.getActiveObjects());
  };

  const saveHistory = (c: fabric.Canvas) => {
    if (isHistoryProcessingRef.current) return;
    const json = JSON.stringify(c.toObject(['id', 'placeholder', 'assetId', 'locked', 'name']));
    
    // If we are not at the end of the history, truncate the future
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    
    historyRef.current.push(json);
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const undo = () => {
    if (!canvas || historyIndexRef.current <= 0) return;
    isHistoryProcessingRef.current = true;
    historyIndexRef.current -= 1;
    const json = historyRef.current[historyIndexRef.current];
    canvas.loadFromJSON(json).then(() => {
      canvas.renderAll();
      updateObjectsList(canvas);
      isHistoryProcessingRef.current = false;
    });
  };

  const redo = () => {
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;
    isHistoryProcessingRef.current = true;
    historyIndexRef.current += 1;
    const json = historyRef.current[historyIndexRef.current];
    canvas.loadFromJSON(json).then(() => {
      canvas.renderAll();
      updateObjectsList(canvas);
      isHistoryProcessingRef.current = false;
    });
  };

  const addText = (text: string, options: Partial<fabric.TextboxProps> = {}, placeholder?: any) => {
    if (!canvas) return;
    const obj = new fabric.Textbox(text, {
      left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2, originX: 'center', originY: 'center',
      fontSize: 32, fontFamily: 'Poppins', fill: '#0F172A', width: 400, textAlign: 'center',
      ...options,
    });
    if (placeholder) (obj as any).placeholder = placeholder;
    obj.setControlsVisibility({ mb: false, mt: false }); // Text usually scales proportionally
    canvas.add(obj);
    canvas.setActiveObject(obj);
  };

  const addSvg = (svgString: string, assetId: string, name: string = 'Asset') => {
    if (!canvas) return;
    fabric.loadSVGFromString(svgString).then(({ objects, options }) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      obj.set({
        left: CANVAS_WIDTH / 2, top: CANVAS_HEIGHT / 2, originX: 'center', originY: 'center',
      });
      // Scale down if it's too big
      if ((obj.width || 0) > CANVAS_WIDTH - 100) obj.scaleToWidth(CANVAS_WIDTH - 100);
      
      (obj as any).assetId = assetId;
      (obj as any).name = name;
      canvas.add(obj);
      canvas.setActiveObject(obj);
    });
  };

  const setBackgroundImage = (url: string | null) => {
    if (!canvas) return;
    if (!url) {
      canvas.backgroundImage = undefined;
      canvas.renderAll();
      saveHistory(canvas);
      return;
    }
    fabric.FabricImage.fromURL(url).then((img) => {
      img.set({ scaleX: CANVAS_WIDTH / (img.width || 1), scaleY: CANVAS_HEIGHT / (img.height || 1) });
      canvas.backgroundImage = img;
      canvas.renderAll();
      saveHistory(canvas);
    });
  };

  const deleteSelection = () => {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length) {
      active.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

  const duplicateSelection = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    activeObj.clone().then((cloned: fabric.FabricObject) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        evented: true,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        (cloned as fabric.ActiveSelection).forEachObject((obj) => canvas.add(obj));
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  const toggleLock = (obj: fabric.Object) => {
    if (!canvas) return;
    const isLocked = !obj.lockMovementX;
    obj.set({
      lockMovementX: isLocked, lockMovementY: isLocked, lockRotation: isLocked,
      lockScalingX: isLocked, lockScalingY: isLocked, hasControls: !isLocked, hasBorders: !isLocked,
    });
    (obj as any).locked = isLocked;
    canvas.requestRenderAll();
    updateObjectsList(canvas);
  };

  const toggleVisibility = (obj: fabric.Object) => {
    if (!canvas) return;
    obj.set({ visible: !obj.visible });
    canvas.requestRenderAll();
    updateObjectsList(canvas);
  };

  const groupSelection = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'activeSelection') {
      // @ts-ignore - fabric v7 removed toGroup, use internal group method
      (activeObj as fabric.ActiveSelection).toGroup?.() ?? (activeObj as any).group?.();
      canvas.requestRenderAll();
      updateObjectsList(canvas);
    }
  };

  const ungroupSelection = () => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'group') {
      // @ts-ignore - fabric v7 removed toActiveSelection
      (activeObj as fabric.Group).toActiveSelection?.() ?? (activeObj as any).ungroup?.();
      canvas.requestRenderAll();
      updateObjectsList(canvas);
    }
  };

  const updateActiveProperty = (key: string, value: any) => {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    active.forEach(obj => obj.set(key as keyof fabric.Object, value));
    canvas.requestRenderAll();
    saveHistory(canvas);
    updateObjectsList(canvas);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete if we're not actively editing text
        if ((canvas?.getActiveObject() as any)?.isEditing) return;
        deleteSelection();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && e.shiftKey && (e.ctrlKey || e.metaKey))) { e.preventDefault(); redo(); }
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); duplicateSelection(); }
      if (e.key === 'g' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); groupSelection(); }
      if (e.key === 'u' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ungroupSelection(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas]);

  return {
    canvasElementRef,
    canvas,
    activeObjects,
    objectsList,
    addText,
    addSvg,
    setBackgroundImage,
    deleteSelection,
    duplicateSelection,
    undo,
    redo,
    toggleLock,
    toggleVisibility,
    groupSelection,
    ungroupSelection,
    updateActiveProperty,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  };
};

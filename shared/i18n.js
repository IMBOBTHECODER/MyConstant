// Translations
// -----------------------------------------
// The extension's own language switcher (the browser's built-in i18n cannot
// change language while running, so this is self-contained).
//
// English is the source language: the English text itself is the lookup
// key, and any text without a translation simply stays English.
//
// This is a classic script, not a module, so the popup, the options page
// and the content script can all load it. It adds one global: MyConstantI18n.
//
// To add a language: add it to LANGUAGES and add a dictionary to
// TRANSLATIONS with the same code. To translate new text: wrap it in
// MyConstantI18n.t('...') in JavaScript, or put data-i18n on the element in
// HTML, then add the English text as a key in each dictionary.

(() => {
  const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文（简体）' },
    { code: 'ja', name: '日本語' },
  ];

  const TRANSLATIONS = {
    vi: {
      // Popup: main view
      'Settings': 'Cài đặt',
      'Search constants': 'Tìm hằng số',
      "The extension's files have changed. Reload it, or the quick picker on web pages stays on the old version.":
        'Các tệp của tiện ích đã thay đổi. Hãy tải lại tiện ích, nếu không bảng chọn nhanh trên trang web vẫn là bản cũ.',
      'Reload the extension now': 'Tải lại tiện ích ngay',
      'Coefficient (e.g. 2 or 1/2)': 'Hệ số (vd: 2 hoặc 1/2)',
      'Type a number, then click a constant to copy it multiplied by that number.':
        'Nhập một số, rồi bấm vào hằng số để sao chép giá trị đã nhân với số đó.',
      'No constants match.': 'Không có hằng số nào khớp.',
      'No exact match. Showing the closest spellings.':
        'Không khớp chính xác. Đang hiển thị kết quả gần đúng nhất.',
      'Pinned': 'Đã ghim',
      'Hover a constant and press {icon} to pin it here.':
        'Di chuột lên một hằng số và bấm {icon} để ghim vào đây.',
      'My constants': 'Hằng số của tôi',
      '+ Add': '+ Thêm',
      'None yet. Press “+ Add” to create one.': 'Chưa có. Bấm “+ Thêm” để tạo.',
      'Name (e.g. g, or LaTeX: m_e)': 'Tên (vd: g, hoặc LaTeX: m_e)',
      'Value (e.g. 9.80665)': 'Giá trị (vd: 9.80665)',
      'Save': 'Lưu',
      'Cancel': 'Hủy',
      'Mathematical constants': 'Hằng số toán học',
      'Physical constants': 'Hằng số vật lý',
      'Chemistry constants': 'Hằng số hóa học',
      'Astronomical constants': 'Hằng số thiên văn',
      'Unit conversions': 'Chuyển đổi đơn vị',
      'Copied {symbol} = {value}': 'Đã sao chép {symbol} = {value}',
      'Copy failed: {error}': 'Sao chép thất bại: {error}',
      'Could not copy': 'Không sao chép được',
      'Could not save: {error}': 'Không lưu được: {error}',
      'Copy {name}, {value}': 'Sao chép {name}, {value}',
      'Pin {name}': 'Ghim {name}',
      'Unpin {name}': 'Bỏ ghim {name}',
      'Remove {name}': 'Xóa {name}',
      'Bin': 'Thùng rác',
      'Bin ({count})': 'Thùng rác ({count})',
      'Removed constants are kept here for 30 days, then deleted for good.':
        'Hằng số đã xóa được giữ ở đây 30 ngày, sau đó bị xóa vĩnh viễn.',
      'The bin is empty.': 'Thùng rác trống.',
      'The bin is nearly full ({percent}%). The oldest constants in it will be deleted to make room.':
        'Thùng rác sắp đầy ({percent}%). Các hằng số cũ nhất trong đó sẽ bị xóa để lấy chỗ.',
      'Restore': 'Khôi phục',
      'Delete now': 'Xóa ngay',
      'Confirm delete': 'Xác nhận xóa',
      'Days left: {days}': 'Còn {days} ngày',
      'Moved {name} to the bin': 'Đã chuyển {name} vào thùng rác',
      'Deleted {name} for good: it is too large for the bin':
        'Đã xóa vĩnh viễn {name}: quá lớn so với thùng rác',
      'Restored {name}': 'Đã khôi phục {name}',
      'Edit {name}': 'Sửa {name}',
      'More constants…': 'Thêm hằng số…',
      '{count} more in the library': 'Còn {count} hằng số trong thư viện',

      // Popup: settings view
      '← Back': '← Quay lại',
      'Enabled': 'Bật',
      'Decimal places': 'Số chữ số thập phân',
      'Notation': 'Dạng số',
      'Normal (3.1415)': 'Thường (3.1415)',
      'Scientific (3.1415e0)': 'Khoa học (3.1415e0)',
      'Language': 'Ngôn ngữ',
      'Auto (browser language)': 'Tự động (theo trình duyệt)',
      'Quick picker': 'Bảng chọn nhanh',
      'Keep quick picker open after copying': 'Giữ bảng chọn nhanh mở sau khi sao chép',
      'When a constant is clicked in the quick picker': 'Khi bấm trong bảng chọn nhanh',
      'Insert and copy': 'Chèn và sao chép',
      'Insert only': 'Chỉ chèn',
      'Copy only': 'Chỉ sao chép',
      'Click, then press the new shortcut': 'Bấm vào, rồi nhấn phím tắt mới',
      'Press keys…': 'Nhấn phím…',
      'Not set': 'Chưa đặt',
      'Press the new shortcut. Esc cancels, Backspace removes it.':
        'Nhấn phím tắt mới. Esc để hủy, Backspace để xóa.',
      'Shortcut removed.': 'Đã xóa phím tắt.',
      'Saved. Works on web pages.': 'Đã lưu. Dùng được trên các trang web.',
      'Include Ctrl or Alt, so it does not trigger while typing.':
        'Cần có Ctrl hoặc Alt để không bị kích hoạt khi đang gõ.',
      'Include Control, Option or Cmd, so it does not trigger while typing.':
        'Cần có Control, Option hoặc Cmd để không bị kích hoạt khi đang gõ.',
      '{shortcut} belongs to the browser ({action}) and would not work. Press a different one.':
        '{shortcut} là phím tắt của trình duyệt ({action}) nên sẽ không hoạt động. Hãy nhấn phím tắt khác.',
      '{shortcut} is already used for “{action}”. Press it again to use it anyway, or press a different one.':
        '{shortcut} đã được dùng cho “{action}”. Nhấn lại lần nữa để vẫn dùng, hoặc nhấn phím tắt khác.',
      'Shortcut not working on a page? Right-click the page and choose “MyConstant: open quick picker”.':
        'Phím tắt không hoạt động trên một trang? Bấm chuột phải vào trang và chọn “MyConstant: mở bảng chọn nhanh”.',
      'MyConstant: open quick picker': 'MyConstant: mở bảng chọn nhanh',
      // Well-known shortcuts, named when a new shortcut clashes with one
      'New tab': 'Thẻ mới',
      'Close tab': 'Đóng thẻ',
      'New window': 'Cửa sổ mới',
      'Reopen closed tab': 'Mở lại thẻ đã đóng',
      'Close window': 'Đóng cửa sổ',
      'Private window': 'Cửa sổ riêng tư',
      'Next tab': 'Thẻ kế tiếp',
      'Previous tab': 'Thẻ trước',
      'Quit': 'Thoát',
      'Copy': 'Sao chép',
      'Paste': 'Dán',
      'Cut': 'Cắt',
      'Select all': 'Chọn tất cả',
      'Undo': 'Hoàn tác',
      'Redo': 'Làm lại',
      'Paste without formatting': 'Dán không định dạng',
      'Save page': 'Lưu trang',
      'Find in page': 'Tìm trong trang',
      'Find next': 'Tìm tiếp',
      'Print': 'In',
      'Reload': 'Tải lại',
      'Address bar': 'Thanh địa chỉ',
      'Search': 'Tìm kiếm',
      'Bookmark this page': 'Đánh dấu trang này',
      'History': 'Lịch sử',
      'Hide window': 'Ẩn cửa sổ',
      'Downloads': 'Tệp tải xuống',
      'Open file': 'Mở tệp',
      'View source': 'Xem mã nguồn',
      'Bold': 'In đậm',
      'Italic': 'In nghiêng',
      'Developer tools': 'Công cụ nhà phát triển',
      'Bookmarks bar': 'Thanh dấu trang',
      'Clear browsing data': 'Xóa dữ liệu duyệt web',
      'Zoom': 'Thu phóng',
      'Send': 'Gửi',
      'Back': 'Quay lại trang trước',
      'Forward': 'Tiến tới trang sau',
      'Browser menu': 'Trình đơn trình duyệt',
      'Home page': 'Trang chủ',
      'Minimise window': 'Thu nhỏ cửa sổ',
      'Help': 'Trợ giúp',
      'Full screen': 'Toàn màn hình',
      'Switch tab': 'Chuyển thẻ',
      'This page': 'Trang này',
      'Active': 'Đang hoạt động',
      'Disabled': 'Đã tắt',
      'Not available (try reloading the tab)': 'Không khả dụng (thử tải lại thẻ)',
      'Advanced settings': 'Cài đặt nâng cao',

      // Options page
      '{name} — Settings': '{name} — Cài đặt',
      'Enable the extension': 'Bật tiện ích',
      'Saved': 'Đã lưu',
      'Reset to defaults': 'Đặt lại mặc định',
      'Click again to confirm': 'Bấm lần nữa để xác nhận',
      'Settings reset. Your constants and pins were kept.':
        'Đã đặt lại cài đặt. Hằng số và ghim của bạn được giữ nguyên.',
      'Resets language, decimal places, notation, number base, shortcut and the on/off switch. Your own constants and pins are kept.':
        'Đặt lại ngôn ngữ, số chữ số thập phân, dạng số, hệ cơ số, phím tắt và công tắc bật/tắt. Hằng số riêng và ghim của bạn được giữ nguyên.',
      'Number base': 'Hệ cơ số',
      'Binary (2)': 'Nhị phân (2)',
      'Octal (8)': 'Bát phân (8)',
      'Decimal (10)': 'Thập phân (10)',
      'Hexadecimal (16)': 'Thập lục phân (16)',
      'Other…': 'Khác…',
      'Digits ({count})': 'Bộ chữ số ({count})',
      'Base (2–36)': 'Cơ số (2–36)',
      'Applies to the built-in constants. Digits above 9 are written as the letters A–Z.':
        'Áp dụng cho các hằng số có sẵn. Chữ số lớn hơn 9 được viết bằng chữ cái A–Z.',
      'Backup': 'Sao lưu',
      'Export to a file': 'Xuất ra tệp',
      'Import from a file': 'Nhập từ tệp',
      'Saves your constants, pins, library selection and settings to a file. Importing a file replaces what you have now.':
        'Lưu hằng số, ghim, lựa chọn thư viện và cài đặt của bạn vào một tệp. Nhập một tệp sẽ thay thế những gì bạn đang có.',
      'Backup saved.': 'Đã lưu bản sao lưu.',
      'Imported. Your own constants: {count}.': 'Đã nhập. Số hằng số riêng của bạn: {count}.',
      'This file is not a MyConstant backup.': 'Tệp này không phải bản sao lưu của MyConstant.',
      'About': 'Thông tin',
      'Extension': 'Tiện ích',
      'Extension ID': 'ID tiện ích',
      'Browser': 'Trình duyệt',
      'Could not read this information: {error}': 'Không đọc được thông tin này: {error}',

      // Library page
      'Constant library': 'Thư viện hằng số',
      'Choose which built-in constants appear in the popup. Click a constant to add or remove it.':
        'Chọn những hằng số có sẵn sẽ hiện trong cửa sổ tiện ích. Bấm vào một hằng số để thêm hoặc bỏ.',
      'Search the library': 'Tìm trong thư viện',
      '{count} of {total} included': 'Đã chọn {count}/{total}',
      'Essentials': 'Cơ bản',
      'Light': 'Gọn',
      'Medium': 'Vừa',
      'All': 'Tất cả',
      'Subjects': 'Theo ngành',
      'Everything': 'Toàn bộ',
      'Mathematics': 'Toán học',
      'Physics': 'Vật lý',
      'Chemistry': 'Hóa học',
      'Astronomy': 'Thiên văn',
      'Engineering': 'Kỹ thuật',
      'Add {name}': 'Thêm {name}',
      'Add all': 'Thêm tất cả',
      'Remove all': 'Bỏ tất cả',

      // Quick picker (on web pages)
      'MyConstant quick picker': 'Bảng chọn nhanh MyConstant',
      'You have no pinned or own constants yet. Here are some popular ones.':
        'Bạn chưa ghim hoặc tạo hằng số nào. Đây là một số hằng số phổ biến.',
      'Popular': 'Phổ biến',
      'Inserted {symbol} = {value}': 'Đã chèn {symbol} = {value}',
      'No text field to insert into': 'Không có ô văn bản để chèn vào',
      'You have no pinned or own constants yet. Here are the ones you use most.':
        'Bạn chưa ghim hoặc tạo hằng số nào. Đây là những hằng số bạn dùng nhiều nhất.',
      'Most used': 'Dùng nhiều nhất',
    },
    es: {
      // Popup: main view
      'Settings': 'Ajustes',
      'Search constants': 'Buscar constantes',
      "The extension's files have changed. Reload it, or the quick picker on web pages stays on the old version.":
        'Los archivos de la extensión han cambiado. Recárgala, o el selector rápido de las páginas web seguirá en la versión anterior.',
      'Reload the extension now': 'Recargar la extensión ahora',
      'Coefficient (e.g. 2 or 1/2)': 'Coeficiente (p. ej. 2 o 1/2)',
      'Type a number, then click a constant to copy it multiplied by that number.':
        'Escribe un número y haz clic en una constante para copiarla multiplicada por ese número.',
      'No constants match.': 'Ninguna constante coincide.',
      'No exact match. Showing the closest spellings.':
        'Sin coincidencia exacta. Se muestran las grafías más parecidas.',
      'Pinned': 'Fijadas',
      'Hover a constant and press {icon} to pin it here.':
        'Pasa el cursor sobre una constante y pulsa {icon} para fijarla aquí.',
      'My constants': 'Mis constantes',
      '+ Add': '+ Añadir',
      'None yet. Press “+ Add” to create one.':
        'Aún no hay ninguna. Pulsa «+ Añadir» para crear una.',
      'Name (e.g. g, or LaTeX: m_e)': 'Nombre (p. ej. g, o LaTeX: m_e)',
      'Value (e.g. 9.80665)': 'Valor (p. ej. 9.80665)',
      'Save': 'Guardar',
      'Cancel': 'Cancelar',
      'Mathematical constants': 'Constantes matemáticas',
      'Physical constants': 'Constantes físicas',
      'Chemistry constants': 'Constantes químicas',
      'Astronomical constants': 'Constantes astronómicas',
      'Unit conversions': 'Conversiones de unidades',
      'Copied {symbol} = {value}': 'Copiado {symbol} = {value}',
      'Copy failed: {error}': 'Error al copiar: {error}',
      'Could not copy': 'No se pudo copiar',
      'Could not save: {error}': 'No se pudo guardar: {error}',
      'Copy {name}, {value}': 'Copiar {name}, {value}',
      'Pin {name}': 'Fijar {name}',
      'Unpin {name}': 'Desfijar {name}',
      'Remove {name}': 'Eliminar {name}',
      'Bin': 'Papelera',
      'Bin ({count})': 'Papelera ({count})',
      'Removed constants are kept here for 30 days, then deleted for good.':
        'Las constantes eliminadas se guardan aquí 30 días y después se borran definitivamente.',
      'The bin is empty.': 'La papelera está vacía.',
      'The bin is nearly full ({percent}%). The oldest constants in it will be deleted to make room.':
        'La papelera está casi llena ({percent} %). Las constantes más antiguas se borrarán para hacer sitio.',
      'Restore': 'Restaurar',
      'Delete now': 'Eliminar ahora',
      'Confirm delete': 'Confirmar',
      'Days left: {days}': 'Días restantes: {days}',
      'Moved {name} to the bin': '{name} se movió a la papelera',
      'Deleted {name} for good: it is too large for the bin':
        '{name} se eliminó definitivamente: es demasiado grande para la papelera',
      'Restored {name}': '{name} restaurada',
      'Edit {name}': 'Editar {name}',
      'More constants…': 'Más constantes…',
      '{count} more in the library': '{count} más en la biblioteca',

      // Popup: settings view
      '← Back': '← Volver',
      'Enabled': 'Activada',
      'Decimal places': 'Decimales',
      'Notation': 'Notación',
      'Normal (3.1415)': 'Normal (3.1415)',
      'Scientific (3.1415e0)': 'Científica (3.1415e0)',
      'Language': 'Idioma',
      'Auto (browser language)': 'Automático (idioma del navegador)',
      'Quick picker': 'Selector rápido',
      'Keep quick picker open after copying':
        'Mantener abierto el selector rápido después de copiar',
      'When a constant is clicked in the quick picker': 'Al hacer clic en el selector rápido',
      'Insert and copy': 'Insertar y copiar',
      'Insert only': 'Solo insertar',
      'Copy only': 'Solo copiar',
      'Click, then press the new shortcut': 'Haz clic y pulsa el nuevo atajo',
      'Press keys…': 'Pulsa las teclas…',
      'Not set': 'Sin asignar',
      'Press the new shortcut. Esc cancels, Backspace removes it.':
        'Pulsa el nuevo atajo. Esc cancela, Retroceso lo elimina.',
      'Shortcut removed.': 'Atajo eliminado.',
      'Saved. Works on web pages.': 'Guardado. Funciona en las páginas web.',
      'Include Ctrl or Alt, so it does not trigger while typing.':
        'Incluye Ctrl o Alt para que no se active al escribir.',
      'Include Control, Option or Cmd, so it does not trigger while typing.':
        'Incluye Control, Opción o Cmd para que no se active al escribir.',
      '{shortcut} belongs to the browser ({action}) and would not work. Press a different one.':
        '{shortcut} pertenece al navegador ({action}) y no funcionaría. Pulsa otro.',
      '{shortcut} is already used for “{action}”. Press it again to use it anyway, or press a different one.':
        '{shortcut} ya se usa para «{action}». Púlsalo de nuevo para usarlo igualmente, o pulsa otro.',
      'Shortcut not working on a page? Right-click the page and choose “MyConstant: open quick picker”.':
        '¿El atajo no funciona en una página? Haz clic derecho en la página y elige «MyConstant: abrir el selector rápido».',
      'MyConstant: open quick picker': 'MyConstant: abrir el selector rápido',
      // Well-known shortcuts, named when a new shortcut clashes with one
      'New tab': 'Nueva pestaña',
      'Close tab': 'Cerrar pestaña',
      'New window': 'Nueva ventana',
      'Reopen closed tab': 'Reabrir pestaña cerrada',
      'Close window': 'Cerrar ventana',
      'Private window': 'Ventana privada',
      'Next tab': 'Pestaña siguiente',
      'Previous tab': 'Pestaña anterior',
      'Quit': 'Salir',
      'Copy': 'Copiar',
      'Paste': 'Pegar',
      'Cut': 'Cortar',
      'Select all': 'Seleccionar todo',
      'Undo': 'Deshacer',
      'Redo': 'Rehacer',
      'Paste without formatting': 'Pegar sin formato',
      'Save page': 'Guardar página',
      'Find in page': 'Buscar en la página',
      'Find next': 'Buscar siguiente',
      'Print': 'Imprimir',
      'Reload': 'Recargar',
      'Address bar': 'Barra de direcciones',
      'Search': 'Buscar',
      'Bookmark this page': 'Añadir esta página a marcadores',
      'History': 'Historial',
      'Hide window': 'Ocultar ventana',
      'Downloads': 'Descargas',
      'Open file': 'Abrir archivo',
      'View source': 'Ver código fuente',
      'Bold': 'Negrita',
      'Italic': 'Cursiva',
      'Developer tools': 'Herramientas para desarrolladores',
      'Bookmarks bar': 'Barra de marcadores',
      'Clear browsing data': 'Borrar datos de navegación',
      'Zoom': 'Zoom',
      'Send': 'Enviar',
      'Back': 'Atrás',
      'Forward': 'Adelante',
      'Browser menu': 'Menú del navegador',
      'Home page': 'Página de inicio',
      'Minimise window': 'Minimizar ventana',
      'Help': 'Ayuda',
      'Full screen': 'Pantalla completa',
      'Switch tab': 'Cambiar de pestaña',
      'This page': 'Esta página',
      'Active': 'Activo',
      'Disabled': 'Desactivado',
      'Not available (try reloading the tab)': 'No disponible (prueba a recargar la pestaña)',
      'Advanced settings': 'Ajustes avanzados',

      // Options page
      '{name} — Settings': '{name} — Ajustes',
      'Enable the extension': 'Activar la extensión',
      'Saved': 'Guardado',
      'Reset to defaults': 'Restablecer valores predeterminados',
      'Click again to confirm': 'Haz clic de nuevo para confirmar',
      'Settings reset. Your constants and pins were kept.':
        'Ajustes restablecidos. Tus constantes y fijadas se han conservado.',
      'Resets language, decimal places, notation, number base, shortcut and the on/off switch. Your own constants and pins are kept.':
        'Restablece el idioma, los decimales, la notación, la base numérica, el atajo y el interruptor de activación. Tus constantes propias y las fijadas se conservan.',
      'Number base': 'Base numérica',
      'Binary (2)': 'Binaria (2)',
      'Octal (8)': 'Octal (8)',
      'Decimal (10)': 'Decimal (10)',
      'Hexadecimal (16)': 'Hexadecimal (16)',
      'Other…': 'Otra…',
      'Digits ({count})': 'Dígitos ({count})',
      'Base (2–36)': 'Base (2–36)',
      'Applies to the built-in constants. Digits above 9 are written as the letters A–Z.':
        'Se aplica a las constantes incluidas. Los dígitos mayores que 9 se escriben con las letras A–Z.',
      'Backup': 'Copia de seguridad',
      'Export to a file': 'Exportar a un archivo',
      'Import from a file': 'Importar desde un archivo',
      'Saves your constants, pins, library selection and settings to a file. Importing a file replaces what you have now.':
        'Guarda tus constantes, fijadas, selección de la biblioteca y ajustes en un archivo. Importar un archivo sustituye lo que tienes ahora.',
      'Backup saved.': 'Copia de seguridad guardada.',
      'Imported. Your own constants: {count}.': 'Importado. Constantes propias: {count}.',
      'This file is not a MyConstant backup.':
        'Este archivo no es una copia de seguridad de MyConstant.',
      'About': 'Acerca de',
      'Extension': 'Extensión',
      'Extension ID': 'ID de la extensión',
      'Browser': 'Navegador',
      'Could not read this information: {error}': 'No se pudo leer esta información: {error}',

      // Library page
      'Constant library': 'Biblioteca de constantes',
      'Choose which built-in constants appear in the popup. Click a constant to add or remove it.':
        'Elige qué constantes incluidas aparecen en la ventana emergente. Haz clic en una constante para añadirla o quitarla.',
      'Search the library': 'Buscar en la biblioteca',
      '{count} of {total} included': '{count} de {total} incluidas',
      'Essentials': 'Esenciales',
      'Light': 'Ligero',
      'Medium': 'Medio',
      'All': 'Todas',
      'Subjects': 'Materias',
      'Everything': 'Todo',
      'Mathematics': 'Matemáticas',
      'Physics': 'Física',
      'Chemistry': 'Química',
      'Astronomy': 'Astronomía',
      'Engineering': 'Ingeniería',
      'Add {name}': 'Añadir {name}',
      'Add all': 'Añadir todas',
      'Remove all': 'Quitar todas',

      // Quick picker (on web pages)
      'MyConstant quick picker': 'Selector rápido de MyConstant',
      'You have no pinned or own constants yet. Here are some popular ones.':
        'Aún no tienes constantes fijadas ni propias. Aquí tienes algunas populares.',
      'Popular': 'Populares',
      'Inserted {symbol} = {value}': 'Insertado {symbol} = {value}',
      'No text field to insert into': 'No hay ningún campo de texto donde insertar',
      'You have no pinned or own constants yet. Here are the ones you use most.':
        'Aún no tienes constantes fijadas ni propias. Aquí tienes las que más usas.',
      'Most used': 'Más usadas',
    },
    fr: {
      // Popup: main view
      'Settings': 'Paramètres',
      'Search constants': 'Rechercher des constantes',
      "The extension's files have changed. Reload it, or the quick picker on web pages stays on the old version.":
        'Les fichiers de l’extension ont changé. Rechargez-la, sinon le sélecteur rapide des pages web restera sur l’ancienne version.',
      'Reload the extension now': 'Recharger l’extension maintenant',
      'Coefficient (e.g. 2 or 1/2)': 'Coefficient (p. ex. 2 ou 1/2)',
      'Type a number, then click a constant to copy it multiplied by that number.':
        'Saisissez un nombre, puis cliquez sur une constante pour la copier multipliée par ce nombre.',
      'No constants match.': 'Aucune constante ne correspond.',
      'No exact match. Showing the closest spellings.':
        'Aucune correspondance exacte. Affichage des orthographes les plus proches.',
      'Pinned': 'Épinglées',
      'Hover a constant and press {icon} to pin it here.':
        'Survolez une constante et appuyez sur {icon} pour l’épingler ici.',
      'My constants': 'Mes constantes',
      '+ Add': '+ Ajouter',
      'None yet. Press “+ Add” to create one.':
        'Aucune pour l’instant. Appuyez sur « + Ajouter » pour en créer une.',
      'Name (e.g. g, or LaTeX: m_e)': 'Nom (p. ex. g, ou LaTeX : m_e)',
      'Value (e.g. 9.80665)': 'Valeur (p. ex. 9.80665)',
      'Save': 'Enregistrer',
      'Cancel': 'Annuler',
      'Mathematical constants': 'Constantes mathématiques',
      'Physical constants': 'Constantes physiques',
      'Chemistry constants': 'Constantes chimiques',
      'Astronomical constants': 'Constantes astronomiques',
      'Unit conversions': 'Conversions d’unités',
      'Copied {symbol} = {value}': 'Copié : {symbol} = {value}',
      'Copy failed: {error}': 'Échec de la copie : {error}',
      'Could not copy': 'Copie impossible',
      'Could not save: {error}': 'Enregistrement impossible : {error}',
      'Copy {name}, {value}': 'Copier {name}, {value}',
      'Pin {name}': 'Épingler {name}',
      'Unpin {name}': 'Désépingler {name}',
      'Remove {name}': 'Supprimer {name}',
      'Bin': 'Corbeille',
      'Bin ({count})': 'Corbeille ({count})',
      'Removed constants are kept here for 30 days, then deleted for good.':
        'Les constantes supprimées sont conservées ici 30 jours, puis effacées définitivement.',
      'The bin is empty.': 'La corbeille est vide.',
      'The bin is nearly full ({percent}%). The oldest constants in it will be deleted to make room.':
        'La corbeille est presque pleine ({percent} %). Les constantes les plus anciennes seront effacées pour faire de la place.',
      'Restore': 'Restaurer',
      'Delete now': 'Supprimer maintenant',
      'Confirm delete': 'Confirmer',
      'Days left: {days}': 'Jours restants : {days}',
      'Moved {name} to the bin': '{name} déplacée dans la corbeille',
      'Deleted {name} for good: it is too large for the bin':
        '{name} supprimée définitivement : trop volumineuse pour la corbeille',
      'Restored {name}': '{name} restaurée',
      'Edit {name}': 'Modifier {name}',
      'More constants…': 'Plus de constantes…',
      '{count} more in the library': '{count} de plus dans la bibliothèque',

      // Popup: settings view
      '← Back': '← Retour',
      'Enabled': 'Activée',
      'Decimal places': 'Décimales',
      'Notation': 'Notation',
      'Normal (3.1415)': 'Normale (3.1415)',
      'Scientific (3.1415e0)': 'Scientifique (3.1415e0)',
      'Language': 'Langue',
      'Auto (browser language)': 'Automatique (langue du navigateur)',
      'Quick picker': 'Sélecteur rapide',
      'Keep quick picker open after copying': 'Garder le sélecteur rapide ouvert après la copie',
      'When a constant is clicked in the quick picker': 'Au clic dans le sélecteur rapide',
      'Insert and copy': 'Insérer et copier',
      'Insert only': 'Insérer seulement',
      'Copy only': 'Copier seulement',
      'Click, then press the new shortcut': 'Cliquez, puis appuyez sur le nouveau raccourci',
      'Press keys…': 'Appuyez sur les touches…',
      'Not set': 'Non défini',
      'Press the new shortcut. Esc cancels, Backspace removes it.':
        'Appuyez sur le nouveau raccourci. Échap annule, Retour arrière le supprime.',
      'Shortcut removed.': 'Raccourci supprimé.',
      'Saved. Works on web pages.': 'Enregistré. Fonctionne sur les pages web.',
      'Include Ctrl or Alt, so it does not trigger while typing.':
        'Incluez Ctrl ou Alt pour qu’il ne se déclenche pas pendant la saisie.',
      'Include Control, Option or Cmd, so it does not trigger while typing.':
        'Incluez Control, Option ou Cmd pour qu’il ne se déclenche pas pendant la saisie.',
      '{shortcut} belongs to the browser ({action}) and would not work. Press a different one.':
        '{shortcut} appartient au navigateur ({action}) et ne fonctionnerait pas. Appuyez sur un autre.',
      '{shortcut} is already used for “{action}”. Press it again to use it anyway, or press a different one.':
        '{shortcut} est déjà utilisé pour « {action} ». Appuyez de nouveau pour l’utiliser quand même, ou appuyez sur un autre.',
      'Shortcut not working on a page? Right-click the page and choose “MyConstant: open quick picker”.':
        'Le raccourci ne fonctionne pas sur une page ? Faites un clic droit sur la page et choisissez « MyConstant : ouvrir le sélecteur rapide ».',
      'MyConstant: open quick picker': 'MyConstant : ouvrir le sélecteur rapide',
      // Well-known shortcuts, named when a new shortcut clashes with one
      'New tab': 'Nouvel onglet',
      'Close tab': 'Fermer l’onglet',
      'New window': 'Nouvelle fenêtre',
      'Reopen closed tab': 'Rouvrir l’onglet fermé',
      'Close window': 'Fermer la fenêtre',
      'Private window': 'Fenêtre privée',
      'Next tab': 'Onglet suivant',
      'Previous tab': 'Onglet précédent',
      'Quit': 'Quitter',
      'Copy': 'Copier',
      'Paste': 'Coller',
      'Cut': 'Couper',
      'Select all': 'Tout sélectionner',
      'Undo': 'Annuler',
      'Redo': 'Rétablir',
      'Paste without formatting': 'Coller sans mise en forme',
      'Save page': 'Enregistrer la page',
      'Find in page': 'Rechercher dans la page',
      'Find next': 'Rechercher le suivant',
      'Print': 'Imprimer',
      'Reload': 'Actualiser',
      'Address bar': 'Barre d’adresse',
      'Search': 'Rechercher',
      'Bookmark this page': 'Ajouter cette page aux favoris',
      'History': 'Historique',
      'Hide window': 'Masquer la fenêtre',
      'Downloads': 'Téléchargements',
      'Open file': 'Ouvrir un fichier',
      'View source': 'Afficher le code source',
      'Bold': 'Gras',
      'Italic': 'Italique',
      'Developer tools': 'Outils de développement',
      'Bookmarks bar': 'Barre de favoris',
      'Clear browsing data': 'Effacer les données de navigation',
      'Zoom': 'Zoom',
      'Send': 'Envoyer',
      'Back': 'Page précédente',
      'Forward': 'Page suivante',
      'Browser menu': 'Menu du navigateur',
      'Home page': 'Page d’accueil',
      'Minimise window': 'Réduire la fenêtre',
      'Help': 'Aide',
      'Full screen': 'Plein écran',
      'Switch tab': 'Changer d’onglet',
      'This page': 'Cette page',
      'Active': 'Actif',
      'Disabled': 'Désactivé',
      'Not available (try reloading the tab)': 'Indisponible (essayez de recharger l’onglet)',
      'Advanced settings': 'Paramètres avancés',

      // Options page
      '{name} — Settings': '{name} — Paramètres',
      'Enable the extension': 'Activer l’extension',
      'Saved': 'Enregistré',
      'Reset to defaults': 'Rétablir les valeurs par défaut',
      'Click again to confirm': 'Cliquez de nouveau pour confirmer',
      'Settings reset. Your constants and pins were kept.':
        'Paramètres réinitialisés. Vos constantes et épingles ont été conservées.',
      'Resets language, decimal places, notation, number base, shortcut and the on/off switch. Your own constants and pins are kept.':
        'Réinitialise la langue, les décimales, la notation, la base de numération, le raccourci et l’interrupteur marche/arrêt. Vos propres constantes et vos épingles sont conservées.',
      'Number base': 'Base de numération',
      'Binary (2)': 'Binaire (2)',
      'Octal (8)': 'Octale (8)',
      'Decimal (10)': 'Décimale (10)',
      'Hexadecimal (16)': 'Hexadécimale (16)',
      'Other…': 'Autre…',
      'Digits ({count})': 'Chiffres ({count})',
      'Base (2–36)': 'Base (2–36)',
      'Applies to the built-in constants. Digits above 9 are written as the letters A–Z.':
        'S’applique aux constantes intégrées. Les chiffres au-delà de 9 sont écrits avec les lettres A–Z.',
      'Backup': 'Sauvegarde',
      'Export to a file': 'Exporter vers un fichier',
      'Import from a file': 'Importer depuis un fichier',
      'Saves your constants, pins, library selection and settings to a file. Importing a file replaces what you have now.':
        'Enregistre vos constantes, vos épingles, votre sélection de la bibliothèque et vos paramètres dans un fichier. Importer un fichier remplace ce que vous avez actuellement.',
      'Backup saved.': 'Sauvegarde enregistrée.',
      'Imported. Your own constants: {count}.': 'Importé. Vos propres constantes : {count}.',
      'This file is not a MyConstant backup.': 'Ce fichier n’est pas une sauvegarde MyConstant.',
      'About': 'À propos',
      'Extension': 'Extension',
      'Extension ID': 'ID de l’extension',
      'Browser': 'Navigateur',
      'Could not read this information: {error}': 'Impossible de lire ces informations : {error}',

      // Library page
      'Constant library': 'Bibliothèque de constantes',
      'Choose which built-in constants appear in the popup. Click a constant to add or remove it.':
        'Choisissez les constantes intégrées qui apparaissent dans la fenêtre de l’extension. Cliquez sur une constante pour l’ajouter ou la retirer.',
      'Search the library': 'Rechercher dans la bibliothèque',
      '{count} of {total} included': '{count} sur {total} incluses',
      'Essentials': 'Essentiels',
      'Light': 'Léger',
      'Medium': 'Moyen',
      'All': 'Toutes',
      'Subjects': 'Matières',
      'Everything': 'Tout',
      'Mathematics': 'Mathématiques',
      'Physics': 'Physique',
      'Chemistry': 'Chimie',
      'Astronomy': 'Astronomie',
      'Engineering': 'Ingénierie',
      'Add {name}': 'Ajouter {name}',
      'Add all': 'Tout ajouter',
      'Remove all': 'Tout retirer',

      // Quick picker (on web pages)
      'MyConstant quick picker': 'Sélecteur rapide MyConstant',
      'You have no pinned or own constants yet. Here are some popular ones.':
        'Vous n’avez pas encore de constantes épinglées ou personnelles. En voici quelques-unes populaires.',
      'Popular': 'Populaires',
      'Inserted {symbol} = {value}': 'Inséré : {symbol} = {value}',
      'No text field to insert into': 'Aucun champ de texte où insérer',
      'You have no pinned or own constants yet. Here are the ones you use most.':
        'Vous n’avez pas encore de constantes épinglées ou personnelles. Voici celles que vous utilisez le plus.',
      'Most used': 'Les plus utilisées',
    },
    de: {
      // Popup: main view
      'Settings': 'Einstellungen',
      'Search constants': 'Konstanten suchen',
      "The extension's files have changed. Reload it, or the quick picker on web pages stays on the old version.":
        'Die Dateien der Erweiterung haben sich geändert. Lade sie neu, sonst bleibt die Schnellauswahl auf Webseiten bei der alten Version.',
      'Reload the extension now': 'Erweiterung jetzt neu laden',
      'Coefficient (e.g. 2 or 1/2)': 'Koeffizient (z. B. 2 oder 1/2)',
      'Type a number, then click a constant to copy it multiplied by that number.':
        'Gib eine Zahl ein und klicke dann auf eine Konstante, um sie mit dieser Zahl multipliziert zu kopieren.',
      'No constants match.': 'Keine passenden Konstanten.',
      'No exact match. Showing the closest spellings.':
        'Kein genauer Treffer. Die ähnlichsten Schreibweisen werden angezeigt.',
      'Pinned': 'Angeheftet',
      'Hover a constant and press {icon} to pin it here.':
        'Fahre über eine Konstante und drücke {icon}, um sie hier anzuheften.',
      'My constants': 'Meine Konstanten',
      '+ Add': '+ Hinzufügen',
      'None yet. Press “+ Add” to create one.':
        'Noch keine. Drücke „+ Hinzufügen“, um eine zu erstellen.',
      'Name (e.g. g, or LaTeX: m_e)': 'Name (z. B. g, oder LaTeX: m_e)',
      'Value (e.g. 9.80665)': 'Wert (z. B. 9.80665)',
      'Save': 'Speichern',
      'Cancel': 'Abbrechen',
      'Mathematical constants': 'Mathematische Konstanten',
      'Physical constants': 'Physikalische Konstanten',
      'Chemistry constants': 'Chemische Konstanten',
      'Astronomical constants': 'Astronomische Konstanten',
      'Unit conversions': 'Einheitenumrechnungen',
      'Copied {symbol} = {value}': 'Kopiert: {symbol} = {value}',
      'Copy failed: {error}': 'Kopieren fehlgeschlagen: {error}',
      'Could not copy': 'Kopieren nicht möglich',
      'Could not save: {error}': 'Speichern nicht möglich: {error}',
      'Copy {name}, {value}': '{name} kopieren, {value}',
      'Pin {name}': '{name} anheften',
      'Unpin {name}': '{name} lösen',
      'Remove {name}': '{name} entfernen',
      'Bin': 'Papierkorb',
      'Bin ({count})': 'Papierkorb ({count})',
      'Removed constants are kept here for 30 days, then deleted for good.':
        'Entfernte Konstanten bleiben hier 30 Tage und werden dann endgültig gelöscht.',
      'The bin is empty.': 'Der Papierkorb ist leer.',
      'The bin is nearly full ({percent}%). The oldest constants in it will be deleted to make room.':
        'Der Papierkorb ist fast voll ({percent} %). Die ältesten Konstanten darin werden gelöscht, um Platz zu schaffen.',
      'Restore': 'Wiederherstellen',
      'Delete now': 'Jetzt löschen',
      'Confirm delete': 'Bestätigen',
      'Days left: {days}': 'Verbleibende Tage: {days}',
      'Moved {name} to the bin': '{name} in den Papierkorb verschoben',
      'Deleted {name} for good: it is too large for the bin':
        '{name} endgültig gelöscht: zu groß für den Papierkorb',
      'Restored {name}': '{name} wiederhergestellt',
      'Edit {name}': '{name} bearbeiten',
      'More constants…': 'Weitere Konstanten…',
      '{count} more in the library': '{count} weitere in der Bibliothek',

      // Popup: settings view
      '← Back': '← Zurück',
      'Enabled': 'Aktiviert',
      'Decimal places': 'Dezimalstellen',
      'Notation': 'Schreibweise',
      'Normal (3.1415)': 'Normal (3.1415)',
      'Scientific (3.1415e0)': 'Wissenschaftlich (3.1415e0)',
      'Language': 'Sprache',
      'Auto (browser language)': 'Automatisch (Browsersprache)',
      'Quick picker': 'Schnellauswahl',
      'Keep quick picker open after copying': 'Schnellauswahl nach dem Kopieren geöffnet lassen',
      'When a constant is clicked in the quick picker': 'Beim Klick in der Schnellauswahl',
      'Insert and copy': 'Einfügen und kopieren',
      'Insert only': 'Nur einfügen',
      'Copy only': 'Nur kopieren',
      'Click, then press the new shortcut': 'Klicken, dann das neue Tastenkürzel drücken',
      'Press keys…': 'Tasten drücken…',
      'Not set': 'Nicht festgelegt',
      'Press the new shortcut. Esc cancels, Backspace removes it.':
        'Drücke das neue Tastenkürzel. Esc bricht ab, die Rücktaste entfernt es.',
      'Shortcut removed.': 'Tastenkürzel entfernt.',
      'Saved. Works on web pages.': 'Gespeichert. Funktioniert auf Webseiten.',
      'Include Ctrl or Alt, so it does not trigger while typing.':
        'Verwende Ctrl oder Alt, damit es beim Tippen nicht ausgelöst wird.',
      'Include Control, Option or Cmd, so it does not trigger while typing.':
        'Verwende Control, Option oder Cmd, damit es beim Tippen nicht ausgelöst wird.',
      '{shortcut} belongs to the browser ({action}) and would not work. Press a different one.':
        '{shortcut} gehört dem Browser ({action}) und würde nicht funktionieren. Drücke ein anderes.',
      '{shortcut} is already used for “{action}”. Press it again to use it anyway, or press a different one.':
        '{shortcut} wird bereits für „{action}“ verwendet. Drücke es erneut, um es trotzdem zu verwenden, oder drücke ein anderes.',
      'Shortcut not working on a page? Right-click the page and choose “MyConstant: open quick picker”.':
        'Das Tastenkürzel funktioniert auf einer Seite nicht? Klicke mit der rechten Maustaste auf die Seite und wähle „MyConstant: Schnellauswahl öffnen“.',
      'MyConstant: open quick picker': 'MyConstant: Schnellauswahl öffnen',
      // Well-known shortcuts, named when a new shortcut clashes with one
      'New tab': 'Neuer Tab',
      'Close tab': 'Tab schließen',
      'New window': 'Neues Fenster',
      'Reopen closed tab': 'Geschlossenen Tab wieder öffnen',
      'Close window': 'Fenster schließen',
      'Private window': 'Privates Fenster',
      'Next tab': 'Nächster Tab',
      'Previous tab': 'Vorheriger Tab',
      'Quit': 'Beenden',
      'Copy': 'Kopieren',
      'Paste': 'Einfügen',
      'Cut': 'Ausschneiden',
      'Select all': 'Alles auswählen',
      'Undo': 'Rückgängig',
      'Redo': 'Wiederholen',
      'Paste without formatting': 'Ohne Formatierung einfügen',
      'Save page': 'Seite speichern',
      'Find in page': 'Auf der Seite suchen',
      'Find next': 'Weitersuchen',
      'Print': 'Drucken',
      'Reload': 'Neu laden',
      'Address bar': 'Adressleiste',
      'Search': 'Suchen',
      'Bookmark this page': 'Lesezeichen für diese Seite',
      'History': 'Verlauf',
      'Hide window': 'Fenster ausblenden',
      'Downloads': 'Downloads',
      'Open file': 'Datei öffnen',
      'View source': 'Seitenquelltext anzeigen',
      'Bold': 'Fett',
      'Italic': 'Kursiv',
      'Developer tools': 'Entwicklerwerkzeuge',
      'Bookmarks bar': 'Lesezeichenleiste',
      'Clear browsing data': 'Browserdaten löschen',
      'Zoom': 'Zoom',
      'Send': 'Senden',
      'Back': 'Zurück',
      'Forward': 'Vorwärts',
      'Browser menu': 'Browsermenü',
      'Home page': 'Startseite',
      'Minimise window': 'Fenster minimieren',
      'Help': 'Hilfe',
      'Full screen': 'Vollbild',
      'Switch tab': 'Tab wechseln',
      'This page': 'Diese Seite',
      'Active': 'Aktiv',
      'Disabled': 'Deaktiviert',
      'Not available (try reloading the tab)': 'Nicht verfügbar (versuche, den Tab neu zu laden)',
      'Advanced settings': 'Erweiterte Einstellungen',

      // Options page
      '{name} — Settings': '{name} — Einstellungen',
      'Enable the extension': 'Erweiterung aktivieren',
      'Saved': 'Gespeichert',
      'Reset to defaults': 'Auf Standardwerte zurücksetzen',
      'Click again to confirm': 'Zum Bestätigen erneut klicken',
      'Settings reset. Your constants and pins were kept.':
        'Einstellungen zurückgesetzt. Deine Konstanten und angehefteten Einträge wurden beibehalten.',
      'Resets language, decimal places, notation, number base, shortcut and the on/off switch. Your own constants and pins are kept.':
        'Setzt Sprache, Dezimalstellen, Schreibweise, Zahlenbasis, Tastenkürzel und den Ein/Aus-Schalter zurück. Deine eigenen Konstanten und angehefteten Einträge bleiben erhalten.',
      'Number base': 'Zahlenbasis',
      'Binary (2)': 'Binär (2)',
      'Octal (8)': 'Oktal (8)',
      'Decimal (10)': 'Dezimal (10)',
      'Hexadecimal (16)': 'Hexadezimal (16)',
      'Other…': 'Andere…',
      'Digits ({count})': 'Ziffern ({count})',
      'Base (2–36)': 'Basis (2–36)',
      'Applies to the built-in constants. Digits above 9 are written as the letters A–Z.':
        'Gilt für die integrierten Konstanten. Ziffern über 9 werden als Buchstaben A–Z geschrieben.',
      'Backup': 'Sicherung',
      'Export to a file': 'In eine Datei exportieren',
      'Import from a file': 'Aus einer Datei importieren',
      'Saves your constants, pins, library selection and settings to a file. Importing a file replaces what you have now.':
        'Speichert deine Konstanten, angehefteten Einträge, die Bibliotheksauswahl und die Einstellungen in einer Datei. Der Import einer Datei ersetzt, was du jetzt hast.',
      'Backup saved.': 'Sicherung gespeichert.',
      'Imported. Your own constants: {count}.': 'Importiert. Eigene Konstanten: {count}.',
      'This file is not a MyConstant backup.': 'Diese Datei ist keine MyConstant-Sicherung.',
      'About': 'Info',
      'Extension': 'Erweiterung',
      'Extension ID': 'Erweiterungs-ID',
      'Browser': 'Browser',
      'Could not read this information: {error}':
        'Diese Informationen konnten nicht gelesen werden: {error}',

      // Library page
      'Constant library': 'Konstantenbibliothek',
      'Choose which built-in constants appear in the popup. Click a constant to add or remove it.':
        'Wähle, welche integrierten Konstanten im Popup erscheinen. Klicke auf eine Konstante, um sie hinzuzufügen oder zu entfernen.',
      'Search the library': 'Bibliothek durchsuchen',
      '{count} of {total} included': '{count} von {total} enthalten',
      'Essentials': 'Grundlagen',
      'Light': 'Leicht',
      'Medium': 'Mittel',
      'All': 'Alle',
      'Subjects': 'Fächer',
      'Everything': 'Alles',
      'Mathematics': 'Mathematik',
      'Physics': 'Physik',
      'Chemistry': 'Chemie',
      'Astronomy': 'Astronomie',
      'Engineering': 'Ingenieurwesen',
      'Add {name}': '{name} hinzufügen',
      'Add all': 'Alle hinzufügen',
      'Remove all': 'Alle entfernen',

      // Quick picker (on web pages)
      'MyConstant quick picker': 'MyConstant-Schnellauswahl',
      'You have no pinned or own constants yet. Here are some popular ones.':
        'Du hast noch keine angehefteten oder eigenen Konstanten. Hier sind einige beliebte.',
      'Popular': 'Beliebt',
      'Inserted {symbol} = {value}': 'Eingefügt: {symbol} = {value}',
      'No text field to insert into': 'Kein Textfeld zum Einfügen',
      'You have no pinned or own constants yet. Here are the ones you use most.':
        'Du hast noch keine angehefteten oder eigenen Konstanten. Hier sind die, die du am häufigsten verwendest.',
      'Most used': 'Am häufigsten verwendet',
    },
    zh: {
      // Popup: main view
      'Settings': '设置',
      'Search constants': '搜索常数',
      "The extension's files have changed. Reload it, or the quick picker on web pages stays on the old version.":
        '扩展的文件已更改。请重新加载扩展，否则网页上的快速选择器仍是旧版本。',
      'Reload the extension now': '立即重新加载扩展',
      'Coefficient (e.g. 2 or 1/2)': '系数（例如 2 或 1/2）',
      'Type a number, then click a constant to copy it multiplied by that number.':
        '输入一个数，然后点击常数，即可复制乘以该数后的值。',
      'No constants match.': '没有匹配的常数。',
      'No exact match. Showing the closest spellings.': '没有完全匹配的结果。显示拼写最接近的结果。',
      'Pinned': '已固定',
      'Hover a constant and press {icon} to pin it here.': '将鼠标悬停在常数上并按 {icon}，即可固定到这里。',
      'My constants': '我的常数',
      '+ Add': '+ 添加',
      'None yet. Press “+ Add” to create one.': '还没有。按“+ 添加”来创建。',
      'Name (e.g. g, or LaTeX: m_e)': '名称（例如 g，或 LaTeX：m_e）',
      'Value (e.g. 9.80665)': '数值（例如 9.80665）',
      'Save': '保存',
      'Cancel': '取消',
      'Mathematical constants': '数学常数',
      'Physical constants': '物理常数',
      'Chemistry constants': '化学常数',
      'Astronomical constants': '天文常数',
      'Unit conversions': '单位换算',
      'Copied {symbol} = {value}': '已复制 {symbol} = {value}',
      'Copy failed: {error}': '复制失败：{error}',
      'Could not copy': '无法复制',
      'Could not save: {error}': '无法保存：{error}',
      'Copy {name}, {value}': '复制 {name}，{value}',
      'Pin {name}': '固定 {name}',
      'Unpin {name}': '取消固定 {name}',
      'Remove {name}': '删除 {name}',
      'Bin': '回收站',
      'Bin ({count})': '回收站（{count}）',
      'Removed constants are kept here for 30 days, then deleted for good.':
        '已删除的常数会在这里保留 30 天，之后永久删除。',
      'The bin is empty.': '回收站是空的。',
      'The bin is nearly full ({percent}%). The oldest constants in it will be deleted to make room.':
        '回收站快满了（{percent}%）。其中最早的常数将被删除以腾出空间。',
      'Restore': '恢复',
      'Delete now': '立即删除',
      'Confirm delete': '确认删除',
      'Days left: {days}': '剩余 {days} 天',
      'Moved {name} to the bin': '已将 {name} 移入回收站',
      'Deleted {name} for good: it is too large for the bin':
        '已永久删除 {name}：它太大，放不进回收站',
      'Restored {name}': '已恢复 {name}',
      'Edit {name}': '编辑 {name}',
      'More constants…': '更多常数…',
      '{count} more in the library': '库中还有 {count} 个',

      // Popup: settings view
      '← Back': '← 返回',
      'Enabled': '已启用',
      'Decimal places': '小数位数',
      'Notation': '记数法',
      'Normal (3.1415)': '普通（3.1415）',
      'Scientific (3.1415e0)': '科学记数法（3.1415e0）',
      'Language': '语言',
      'Auto (browser language)': '自动（浏览器语言）',
      'Quick picker': '快速选择器',
      'Keep quick picker open after copying': '复制后保持快速选择器打开',
      'When a constant is clicked in the quick picker': '在快速选择器中点击时',
      'Insert and copy': '插入并复制',
      'Insert only': '仅插入',
      'Copy only': '仅复制',
      'Click, then press the new shortcut': '点击后按下新的快捷键',
      'Press keys…': '请按键…',
      'Not set': '未设置',
      'Press the new shortcut. Esc cancels, Backspace removes it.': '按下新的快捷键。Esc 取消，Backspace 删除。',
      'Shortcut removed.': '快捷键已删除。',
      'Saved. Works on web pages.': '已保存。可在网页上使用。',
      'Include Ctrl or Alt, so it does not trigger while typing.': '请包含 Ctrl 或 Alt，以免打字时误触发。',
      'Include Control, Option or Cmd, so it does not trigger while typing.':
        '请包含 Control、Option 或 Cmd，以免打字时误触发。',
      '{shortcut} belongs to the browser ({action}) and would not work. Press a different one.':
        '{shortcut} 是浏览器的快捷键（{action}），无法使用。请按其他快捷键。',
      '{shortcut} is already used for “{action}”. Press it again to use it anyway, or press a different one.':
        '{shortcut} 已用于“{action}”。再按一次仍然使用，或按其他快捷键。',
      'Shortcut not working on a page? Right-click the page and choose “MyConstant: open quick picker”.':
        '快捷键在某个网页上不起作用？右键点击网页，选择“MyConstant：打开快速选择器”。',
      'MyConstant: open quick picker': 'MyConstant：打开快速选择器',
      // Well-known shortcuts, named when a new shortcut clashes with one
      'New tab': '新标签页',
      'Close tab': '关闭标签页',
      'New window': '新窗口',
      'Reopen closed tab': '重新打开关闭的标签页',
      'Close window': '关闭窗口',
      'Private window': '隐私窗口',
      'Next tab': '下一个标签页',
      'Previous tab': '上一个标签页',
      'Quit': '退出',
      'Copy': '复制',
      'Paste': '粘贴',
      'Cut': '剪切',
      'Select all': '全选',
      'Undo': '撤销',
      'Redo': '重做',
      'Paste without formatting': '粘贴为纯文本',
      'Save page': '保存网页',
      'Find in page': '在页面中查找',
      'Find next': '查找下一个',
      'Print': '打印',
      'Reload': '重新加载',
      'Address bar': '地址栏',
      'Search': '搜索',
      'Bookmark this page': '将此页加入书签',
      'History': '历史记录',
      'Hide window': '隐藏窗口',
      'Downloads': '下载内容',
      'Open file': '打开文件',
      'View source': '查看源代码',
      'Bold': '粗体',
      'Italic': '斜体',
      'Developer tools': '开发者工具',
      'Bookmarks bar': '书签栏',
      'Clear browsing data': '清除浏览数据',
      'Zoom': '缩放',
      'Send': '发送',
      'Back': '后退',
      'Forward': '前进',
      'Browser menu': '浏览器菜单',
      'Home page': '主页',
      'Minimise window': '最小化窗口',
      'Help': '帮助',
      'Full screen': '全屏',
      'Switch tab': '切换标签页',
      'This page': '此页面',
      'Active': '运行中',
      'Disabled': '已停用',
      'Not available (try reloading the tab)': '不可用（请尝试重新加载标签页）',
      'Advanced settings': '高级设置',

      // Options page
      '{name} — Settings': '{name} — 设置',
      'Enable the extension': '启用扩展',
      'Saved': '已保存',
      'Reset to defaults': '恢复默认设置',
      'Click again to confirm': '再次点击以确认',
      'Settings reset. Your constants and pins were kept.': '设置已重置。你的常数和固定项已保留。',
      'Resets language, decimal places, notation, number base, shortcut and the on/off switch. Your own constants and pins are kept.':
        '重置语言、小数位数、记数法、进制、快捷键和开关。你自己的常数和固定项会保留。',
      'Number base': '进制',
      'Binary (2)': '二进制（2）',
      'Octal (8)': '八进制（8）',
      'Decimal (10)': '十进制（10）',
      'Hexadecimal (16)': '十六进制（16）',
      'Other…': '其他…',
      'Digits ({count})': '数字（{count}）',
      'Base (2–36)': '进制（2–36）',
      'Applies to the built-in constants. Digits above 9 are written as the letters A–Z.':
        '适用于内置常数。大于 9 的数字用字母 A–Z 表示。',
      'Backup': '备份',
      'Export to a file': '导出到文件',
      'Import from a file': '从文件导入',
      'Saves your constants, pins, library selection and settings to a file. Importing a file replaces what you have now.':
        '将你的常数、固定项、库选择和设置保存到文件。导入文件会替换你现有的内容。',
      'Backup saved.': '备份已保存。',
      'Imported. Your own constants: {count}.': '已导入。你自己的常数：{count} 个。',
      'This file is not a MyConstant backup.': '此文件不是 MyConstant 备份。',
      'About': '关于',
      'Extension': '扩展',
      'Extension ID': '扩展 ID',
      'Browser': '浏览器',
      'Could not read this information: {error}': '无法读取此信息：{error}',

      // Library page
      'Constant library': '常数库',
      'Choose which built-in constants appear in the popup. Click a constant to add or remove it.':
        '选择哪些内置常数显示在弹出窗口中。点击常数即可添加或移除。',
      'Search the library': '搜索常数库',
      '{count} of {total} included': '已包含 {count}/{total}',
      'Essentials': '基础',
      'Light': '精简',
      'Medium': '中等',
      'All': '全部',
      'Subjects': '学科',
      'Everything': '所有',
      'Mathematics': '数学',
      'Physics': '物理',
      'Chemistry': '化学',
      'Astronomy': '天文',
      'Engineering': '工程',
      'Add {name}': '添加 {name}',
      'Add all': '全部添加',
      'Remove all': '全部移除',

      // Quick picker (on web pages)
      'MyConstant quick picker': 'MyConstant 快速选择器',
      'You have no pinned or own constants yet. Here are some popular ones.':
        '你还没有固定或自己的常数。这里是一些常用的。',
      'Popular': '常用',
      'Inserted {symbol} = {value}': '已插入 {symbol} = {value}',
      'No text field to insert into': '没有可插入的文本框',
      'You have no pinned or own constants yet. Here are the ones you use most.':
        '你还没有固定或自己的常数。这里是你最常用的。',
      'Most used': '最常用',
    },
    ja: {
      // Popup: main view
      'Settings': '設定',
      'Search constants': '定数を検索',
      "The extension's files have changed. Reload it, or the quick picker on web pages stays on the old version.":
        '拡張機能のファイルが変更されました。再読み込みしないと、ウェブページのクイックピッカーは古いバージョンのままです。',
      'Reload the extension now': '拡張機能を今すぐ再読み込み',
      'Coefficient (e.g. 2 or 1/2)': '係数（例: 2 または 1/2）',
      'Type a number, then click a constant to copy it multiplied by that number.':
        '数値を入力してから定数をクリックすると、その数を掛けた値がコピーされます。',
      'No constants match.': '一致する定数がありません。',
      'No exact match. Showing the closest spellings.': '完全一致はありません。綴りが最も近いものを表示しています。',
      'Pinned': 'ピン留め',
      'Hover a constant and press {icon} to pin it here.': '定数にカーソルを合わせて {icon} を押すと、ここにピン留めされます。',
      'My constants': 'マイ定数',
      '+ Add': '+ 追加',
      'None yet. Press “+ Add” to create one.': 'まだありません。「+ 追加」を押して作成してください。',
      'Name (e.g. g, or LaTeX: m_e)': '名前（例: g、または LaTeX: m_e）',
      'Value (e.g. 9.80665)': '値（例: 9.80665）',
      'Save': '保存',
      'Cancel': 'キャンセル',
      'Mathematical constants': '数学定数',
      'Physical constants': '物理定数',
      'Chemistry constants': '化学定数',
      'Astronomical constants': '天文定数',
      'Unit conversions': '単位換算',
      'Copied {symbol} = {value}': 'コピーしました: {symbol} = {value}',
      'Copy failed: {error}': 'コピーに失敗しました: {error}',
      'Could not copy': 'コピーできませんでした',
      'Could not save: {error}': '保存できませんでした: {error}',
      'Copy {name}, {value}': '{name} をコピー、{value}',
      'Pin {name}': '{name} をピン留め',
      'Unpin {name}': '{name} のピン留めを解除',
      'Remove {name}': '{name} を削除',
      'Bin': 'ごみ箱',
      'Bin ({count})': 'ごみ箱（{count}）',
      'Removed constants are kept here for 30 days, then deleted for good.':
        '削除した定数はここに30日間保管され、その後完全に削除されます。',
      'The bin is empty.': 'ごみ箱は空です。',
      'The bin is nearly full ({percent}%). The oldest constants in it will be deleted to make room.':
        'ごみ箱がもうすぐいっぱいです（{percent}%）。古い定数から順に削除されます。',
      'Restore': '復元',
      'Delete now': '今すぐ削除',
      'Confirm delete': '削除を確定',
      'Days left: {days}': '残り {days} 日',
      'Moved {name} to the bin': '{name} をごみ箱に移動しました',
      'Deleted {name} for good: it is too large for the bin':
        '{name} を完全に削除しました: ごみ箱に入らない大きさです',
      'Restored {name}': '{name} を復元しました',
      'Edit {name}': '{name} を編集',
      'More constants…': 'その他の定数…',
      '{count} more in the library': 'ライブラリにあと {count} 個',

      // Popup: settings view
      '← Back': '← 戻る',
      'Enabled': '有効',
      'Decimal places': '小数点以下の桁数',
      'Notation': '表記',
      'Normal (3.1415)': '通常（3.1415）',
      'Scientific (3.1415e0)': '指数表記（3.1415e0）',
      'Language': '言語',
      'Auto (browser language)': '自動（ブラウザの言語）',
      'Quick picker': 'クイックピッカー',
      'Keep quick picker open after copying': 'コピー後もクイックピッカーを開いたままにする',
      'When a constant is clicked in the quick picker': 'クイックピッカーでクリックしたとき',
      'Insert and copy': '挿入してコピー',
      'Insert only': '挿入のみ',
      'Copy only': 'コピーのみ',
      'Click, then press the new shortcut': 'クリックしてから新しいショートカットを押す',
      'Press keys…': 'キーを押してください…',
      'Not set': '未設定',
      'Press the new shortcut. Esc cancels, Backspace removes it.':
        '新しいショートカットを押してください。Esc でキャンセル、Backspace で削除します。',
      'Shortcut removed.': 'ショートカットを削除しました。',
      'Saved. Works on web pages.': '保存しました。ウェブページで使えます。',
      'Include Ctrl or Alt, so it does not trigger while typing.':
        '入力中に反応しないよう、Ctrl か Alt を含めてください。',
      'Include Control, Option or Cmd, so it does not trigger while typing.':
        '入力中に反応しないよう、Control、Option、Cmd のいずれかを含めてください。',
      '{shortcut} belongs to the browser ({action}) and would not work. Press a different one.':
        '{shortcut} はブラウザのショートカット（{action}）のため使えません。別のものを押してください。',
      '{shortcut} is already used for “{action}”. Press it again to use it anyway, or press a different one.':
        '{shortcut} はすでに「{action}」に使われています。それでも使う場合はもう一度押すか、別のものを押してください。',
      'Shortcut not working on a page? Right-click the page and choose “MyConstant: open quick picker”.':
        'ページでショートカットが動作しませんか？ページを右クリックして「MyConstant: クイックピッカーを開く」を選んでください。',
      'MyConstant: open quick picker': 'MyConstant: クイックピッカーを開く',
      // Well-known shortcuts, named when a new shortcut clashes with one
      'New tab': '新しいタブ',
      'Close tab': 'タブを閉じる',
      'New window': '新しいウィンドウ',
      'Reopen closed tab': '閉じたタブを開き直す',
      'Close window': 'ウィンドウを閉じる',
      'Private window': 'プライベートウィンドウ',
      'Next tab': '次のタブ',
      'Previous tab': '前のタブ',
      'Quit': '終了',
      'Copy': 'コピー',
      'Paste': '貼り付け',
      'Cut': '切り取り',
      'Select all': 'すべて選択',
      'Undo': '元に戻す',
      'Redo': 'やり直す',
      'Paste without formatting': '書式なしで貼り付け',
      'Save page': 'ページを保存',
      'Find in page': 'ページ内を検索',
      'Find next': '次を検索',
      'Print': '印刷',
      'Reload': '再読み込み',
      'Address bar': 'アドレスバー',
      'Search': '検索',
      'Bookmark this page': 'このページをブックマーク',
      'History': '履歴',
      'Hide window': 'ウィンドウを隠す',
      'Downloads': 'ダウンロード',
      'Open file': 'ファイルを開く',
      'View source': 'ソースを表示',
      'Bold': '太字',
      'Italic': '斜体',
      'Developer tools': 'デベロッパーツール',
      'Bookmarks bar': 'ブックマークバー',
      'Clear browsing data': '閲覧データを削除',
      'Zoom': 'ズーム',
      'Send': '送信',
      'Back': '戻る',
      'Forward': '進む',
      'Browser menu': 'ブラウザのメニュー',
      'Home page': 'ホームページ',
      'Minimise window': 'ウィンドウを最小化',
      'Help': 'ヘルプ',
      'Full screen': '全画面表示',
      'Switch tab': 'タブを切り替え',
      'This page': 'このページ',
      'Active': '動作中',
      'Disabled': '無効',
      'Not available (try reloading the tab)': '利用できません（タブを再読み込みしてみてください）',
      'Advanced settings': '詳細設定',

      // Options page
      '{name} — Settings': '{name} — 設定',
      'Enable the extension': '拡張機能を有効にする',
      'Saved': '保存しました',
      'Reset to defaults': '既定値に戻す',
      'Click again to confirm': 'もう一度クリックして確定',
      'Settings reset. Your constants and pins were kept.': '設定をリセットしました。定数とピン留めはそのままです。',
      'Resets language, decimal places, notation, number base, shortcut and the on/off switch. Your own constants and pins are kept.':
        '言語、小数点以下の桁数、表記、基数、ショートカット、オン/オフの切り替えをリセットします。自分の定数とピン留めはそのままです。',
      'Number base': '基数',
      'Binary (2)': '2 進数（2）',
      'Octal (8)': '8 進数（8）',
      'Decimal (10)': '10 進数（10）',
      'Hexadecimal (16)': '16 進数（16）',
      'Other…': 'その他…',
      'Digits ({count})': '数字（{count}）',
      'Base (2–36)': '基数（2–36）',
      'Applies to the built-in constants. Digits above 9 are written as the letters A–Z.':
        '内蔵の定数に適用されます。9 より大きい数字は A–Z の文字で表します。',
      'Backup': 'バックアップ',
      'Export to a file': 'ファイルに書き出す',
      'Import from a file': 'ファイルから読み込む',
      'Saves your constants, pins, library selection and settings to a file. Importing a file replaces what you have now.':
        '定数、ピン留め、ライブラリの選択、設定をファイルに保存します。ファイルを読み込むと、現在の内容は置き換えられます。',
      'Backup saved.': 'バックアップを保存しました。',
      'Imported. Your own constants: {count}.': '読み込みました。自分の定数: {count} 個。',
      'This file is not a MyConstant backup.': 'このファイルは MyConstant のバックアップではありません。',
      'About': '情報',
      'Extension': '拡張機能',
      'Extension ID': '拡張機能 ID',
      'Browser': 'ブラウザ',
      'Could not read this information: {error}': 'この情報を読み取れませんでした: {error}',

      // Library page
      'Constant library': '定数ライブラリ',
      'Choose which built-in constants appear in the popup. Click a constant to add or remove it.':
        'ポップアップに表示する内蔵の定数を選びます。定数をクリックすると追加または削除できます。',
      'Search the library': 'ライブラリを検索',
      '{count} of {total} included': '{total} 個中 {count} 個を表示',
      'Essentials': '基本',
      'Light': 'ライト',
      'Medium': 'ミディアム',
      'All': 'すべて',
      'Subjects': '分野',
      'Everything': '全部',
      'Mathematics': '数学',
      'Physics': '物理',
      'Chemistry': '化学',
      'Astronomy': '天文',
      'Engineering': '工学',
      'Add {name}': '{name} を追加',
      'Add all': 'すべて追加',
      'Remove all': 'すべて削除',

      // Quick picker (on web pages)
      'MyConstant quick picker': 'MyConstant クイックピッカー',
      'You have no pinned or own constants yet. Here are some popular ones.':
        'ピン留めした定数も自分の定数もまだありません。よく使われるものを表示しています。',
      'Popular': '人気',
      'Inserted {symbol} = {value}': '挿入しました: {symbol} = {value}',
      'No text field to insert into': '挿入先のテキスト欄がありません',
      'You have no pinned or own constants yet. Here are the ones you use most.':
        'ピン留めした定数も自分の定数もまだありません。よく使うものを表示しています。',
      'Most used': 'よく使う',
    },
  };

  let current = 'en';

  /** Turns the stored setting ('auto' or a language code) into a language code. */
  function resolve(setting) {
    if (LANGUAGES.some((l) => l.code === setting)) return setting;
    // 'auto' (or anything unknown): follow the browser, e.g. "vi-VN" -> "vi".
    const browser = (navigator.language || 'en').toLowerCase().split('-')[0];
    return LANGUAGES.some((l) => l.code === browser) ? browser : 'en';
  }

  /** Translates English `text`, filling in {placeholders} from `values`. */
  function t(text, values) {
    const translated = TRANSLATIONS[current]?.[text] ?? text;
    if (!values) return translated;
    return translated.replace(/\{(\w+)\}/g, (whole, key) =>
      key in values ? String(values[key]) : whole
    );
  }

  // The original English of every element translated so far, so that
  // apply() can be run again after the language changes.
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();

  /**
   * Translates the page (or `root`) in place:
   *   <p data-i18n>English text</p>                    element text
   *   <p data-i18n="Press {icon} now"><span/></p>       text around a child element
   *   <input data-i18n-attr="placeholder aria-label">   attributes
   */
  function apply(root = document) {
    for (const el of root.querySelectorAll('[data-i18n]')) {
      if (!originalText.has(el)) {
        originalText.set(el, el.getAttribute('data-i18n') || el.textContent.trim());
      }
      const translated = t(originalText.get(el));
      const child = el.firstElementChild;
      if (child && translated.includes('{icon}')) {
        const [before, after] = translated.split('{icon}');
        el.replaceChildren(before, child, after);
      } else {
        el.textContent = translated;
      }
    }
    for (const el of root.querySelectorAll('[data-i18n-attr]')) {
      if (!originalAttributes.has(el)) {
        const names = el.getAttribute('data-i18n-attr').split(/\s+/).filter(Boolean);
        originalAttributes.set(el, Object.fromEntries(names.map((n) => [n, el.getAttribute(n) ?? ''])));
      }
      for (const [name, english] of Object.entries(originalAttributes.get(el))) {
        el.setAttribute(name, t(english));
      }
    }
    if (root === document) document.documentElement.lang = current;
  }

  globalThis.MyConstantI18n = {
    LANGUAGES,
    resolve,
    t,
    apply,
    /** Sets the language from the stored setting; returns true if it changed. */
    setLanguage(setting) {
      const next = resolve(setting);
      const changed = next !== current;
      current = next;
      return changed;
    },
    get language() {
      return current;
    },
  };
})();

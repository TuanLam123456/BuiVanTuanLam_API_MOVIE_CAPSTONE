export const buildQueryPrismaHelper = (req) => {
  // Xử lý phân trang
  let { page, pageSize, filters } = req.query;
  console.log({ page, pageSize });

  const pageDefault = 1;
  const pageSizeDefault = 3;

  // Xử lý chuyển trang về số nguyên
  page = Number(page) || pageDefault;
  pageSize = Number(pageSize) || pageSizeDefault;

  // Xử lý trường hợp số âm
  if (page < 1) page = pageDefault;
  if (pageSize < 1) pageSize = pageSizeDefault;

  // index: vị trí bắt đầu lấy dữ liệu
  const index = (page - 1) * pageSize;

  // xử lý filters chuyển đổi từ JSON sang object, nếu không có thì gán mặc định là object rỗng
  try {
    filters = JSON.parse(filters);
  } catch (error) {
    filters = {};
  }

  console.log({ page, pageSize, index, filters });

  // Xử lý filter -> {contains: "Nextjs"}
  // {content: "Nextjs"} -> {content: {contains: "Nextjs"}}
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string") {
      filters[key] = {
        contains: value,
      };
    }
  });

  return { page, pageSize, index, filters };
};
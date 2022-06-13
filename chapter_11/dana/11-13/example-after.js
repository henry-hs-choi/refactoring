class ResourcePool {
    public Resource get() {
        Resource result = available.isEmpty() ? Resource.create() : available.pop();
        allocated.add(result);
        return result;
    }

    private Deque<Resource> available;
    private List<Resource> allocated;
}
class ResourcePool {
    public Resource get() {
        Resource result;
        try {
            result = available.pop();
            allocated.add(result);
        } catch (NoSuchElementException e) {
            result = Resource.create();
            allocated.add(result);
        }
        return result;
    }

    private Deque<Resource> available;
    private List<Resource> allocated;
}